import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Banknote, Download, Pencil, RefreshCw } from 'lucide-react';
import { fetchPayroll, generatePayroll, markPaid, updateDeductions } from '../features/payrollSlice';
import { Badge, ConfirmDialog, DataTable, Field, Modal, PageHeader, Select, StatCard } from '../components/ui';
import { downloadCsv, formatDate, formatINR, monthName, monthOptions, todayISO, yearOptions } from '../utils/format';

const MODES = ['Bank transfer', 'UPI', 'Cash', 'Cheque'].map((v) => ({ value: v, label: v }));

export default function Payroll() {
  const dispatch = useDispatch();
  const { items, totals, loading, saving } = useSelector((s) => s.payroll);
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [confirmGen, setConfirmGen] = useState(false);
  const [deduct, setDeduct] = useState(null);
  const [pay, setPay] = useState(null);

  const load = () => dispatch(fetchPayroll({ month, year, status: status || undefined, search: search || undefined }));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [month, year, status, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const generate = async () => {
    try { await dispatch(generatePayroll({ month, year })).unwrap(); setConfirmGen(false); load(); } catch { setConfirmGen(false); }
  };
  const saveDeduct = async (e) => {
    e.preventDefault();
    try { await dispatch(updateDeductions({ id: deduct.PaymentId, body: { advanceDeduction: deduct.AdvanceDeduction, otherDeduction: deduct.OtherDeduction, remarks: deduct.Remarks } })).unwrap(); setDeduct(null); load(); } catch { /* toast shown */ }
  };
  const savePay = async (e) => {
    e.preventDefault();
    try { await dispatch(markPaid({ id: pay.PaymentId, body: { paidOn: pay.paidOn, paymentMode: pay.paymentMode, referenceNo: pay.referenceNo } })).unwrap(); setPay(null); load(); } catch { /* toast shown */ }
  };

  const exportCsv = () => downloadCsv(`payroll-${year}-${String(month).padStart(2, '0')}.csv`, items, [
    { header: 'Code', value: (r) => r.GuardCode }, { header: 'Guard', value: (r) => r.FullName },
    { header: 'Bank', value: (r) => r.BankName }, { header: 'Account', value: (r) => r.AccountNo }, { header: 'IFSC', value: (r) => r.IfscCode },
    { header: 'Payable days', value: (r) => r.PayableDays }, { header: 'Gross', value: (r) => r.GrossAmount },
    { header: 'PF', value: (r) => r.PfAmount }, { header: 'ESI', value: (r) => r.EsiAmount },
    { header: 'Advance', value: (r) => r.AdvanceDeduction }, { header: 'Other', value: (r) => r.OtherDeduction },
    { header: 'Net pay', value: (r) => r.NetAmount }, { header: 'Status', value: (r) => r.Status },
  ]);

  const net = deduct && (Number(deduct.GrossAmount) - Number(deduct.PfAmount) - Number(deduct.EsiAmount) - (Number(deduct.AdvanceDeduction) || 0) - (Number(deduct.OtherDeduction) || 0));

  const columns = [
    { header: 'Guard', render: (r) => <div><p className="font-medium">{r.FullName}</p><p className="text-xs text-steel">{r.GuardCode}</p></div> },
    { header: 'Days', key: 'PayableDays' },
    { header: 'Salary', render: (r) => formatINR(r.MonthlySalary) },
    { header: 'Gross', render: (r) => formatINR(r.GrossAmount) },
    { header: 'Deductions', render: (r) => formatINR(Number(r.PfAmount) + Number(r.EsiAmount) + Number(r.AdvanceDeduction) + Number(r.OtherDeduction)) },
    { header: 'Net pay', render: (r) => <strong>{formatINR(r.NetAmount)}</strong> },
    { header: 'Status', render: (r) => <Badge tone={r.Status === 'Paid' ? 'ok' : 'warn'}>{r.Status === 'Paid' ? `Paid ${formatDate(r.PaidOn)}` : 'Pending'}</Badge> },
    {
      header: 'Actions', className: 'text-right',
      render: (r) => r.Status === 'Pending' && (
        <div className="flex justify-end gap-1.5">
          <button className="btn-ghost btn-sm" onClick={() => setDeduct({ ...r })}><Pencil size={14} /> Deductions</button>
          <button className="btn-primary btn-sm" onClick={() => setPay({ ...r, paidOn: todayISO(), paymentMode: 'Bank transfer', referenceNo: '' })}><Banknote size={14} /> Pay</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader title="Payroll" subtitle="Monthly salary calculated from attendance">
        <button className="btn-ghost" onClick={exportCsv} disabled={!items.length}><Download size={16} /> Export CSV</button>
        <button className="btn-accent" onClick={() => setConfirmGen(true)}><RefreshCw size={16} /> Generate payroll</button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div><label className="label">Month</label><Select value={month} onChange={(v) => setMonth(Number(v))} options={monthOptions} /></div>
        <div><label className="label">Year</label><Select value={year} onChange={(v) => setYear(Number(v))} options={yearOptions()} /></div>
        <div><label className="label">Status</label><Select value={status} onChange={setStatus} placeholder="All" options={[{ value: 'Pending', label: 'Pending' }, { value: 'Paid', label: 'Paid' }]} /></div>
        <div className="min-w-[200px] flex-1 sm:max-w-xs"><label className="label">Search</label><input className="input" placeholder="Guard name or code" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Guards" value={totals.count} />
        <StatCard label="Total net pay" value={formatINR(totals.net)} />
        <StatCard label="Paid" value={formatINR(totals.paid)} />
        <StatCard label="Pending" value={formatINR(totals.pending)} tone={totals.pending ? 'warn' : undefined} />
      </div>

      <DataTable columns={columns} rows={items} loading={loading} rowKey="PaymentId" empty={`No payroll for ${monthName(month)} ${year}. Use Generate payroll after marking attendance.`} />

      {confirmGen && (
        <ConfirmDialog title="Generate payroll" confirmLabel="Generate" busy={saving} onClose={() => setConfirmGen(false)} onConfirm={generate}
          message={`Calculate salary for ${monthName(month)} ${year} from attendance. Pending rows are refreshed (advance and other deductions are kept). Paid rows are not changed.`} />
      )}

      {deduct && (
        <Modal title={`Deductions - ${deduct.FullName}`} onClose={() => setDeduct(null)} size="sm">
          <form onSubmit={saveDeduct} className="space-y-4">
            <p className="text-sm text-steel">Gross {formatINR(deduct.GrossAmount)}, PF {formatINR(deduct.PfAmount)}, ESI {formatINR(deduct.EsiAmount)}</p>
            <Field label="Advance taken (INR)"><input type="number" min="0" step="0.01" className="input" value={deduct.AdvanceDeduction} onChange={(e) => setDeduct({ ...deduct, AdvanceDeduction: e.target.value })} /></Field>
            <Field label="Other deduction (INR)"><input type="number" min="0" step="0.01" className="input" value={deduct.OtherDeduction} onChange={(e) => setDeduct({ ...deduct, OtherDeduction: e.target.value })} /></Field>
            <Field label="Remarks"><input className="input" value={deduct.Remarks || ''} onChange={(e) => setDeduct({ ...deduct, Remarks: e.target.value })} /></Field>
            <p className="text-sm">Net pay: <strong>{formatINR(Math.max(net, 0))}</strong></p>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setDeduct(null)}>Cancel</button>
              <button className="btn-primary" disabled={saving}>Save</button>
            </div>
          </form>
        </Modal>
      )}

      {pay && (
        <Modal title={`Pay ${pay.FullName}`} onClose={() => setPay(null)} size="sm">
          <form onSubmit={savePay} className="space-y-4">
            <p className="text-2xl font-semibold">{formatINR(pay.NetAmount)}</p>
            <Field label="Payment mode" required><Select value={pay.paymentMode} onChange={(v) => setPay({ ...pay, paymentMode: v })} options={MODES} /></Field>
            <Field label="Paid on" required><input type="date" className="input" max={todayISO()} value={pay.paidOn} onChange={(e) => setPay({ ...pay, paidOn: e.target.value })} required /></Field>
            <Field label="Reference / UTR number"><input className="input" value={pay.referenceNo} onChange={(e) => setPay({ ...pay, referenceNo: e.target.value })} /></Field>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setPay(null)}>Cancel</button>
              <button className="btn-primary" disabled={saving}>Mark as paid</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
