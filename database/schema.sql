/* Neha Industrial Security - MSSQL schema */
SET NOCOUNT ON;

IF OBJECT_ID('dbo.Payments') IS NOT NULL DROP TABLE dbo.Payments;
IF OBJECT_ID('dbo.Attendance') IS NOT NULL DROP TABLE dbo.Attendance;
IF OBJECT_ID('dbo.Deployments') IS NOT NULL DROP TABLE dbo.Deployments;
IF OBJECT_ID('dbo.Guards') IS NOT NULL DROP TABLE dbo.Guards;
IF OBJECT_ID('dbo.Sites') IS NOT NULL DROP TABLE dbo.Sites;
IF OBJECT_ID('dbo.Clients') IS NOT NULL DROP TABLE dbo.Clients;
IF OBJECT_ID('dbo.Contractors') IS NOT NULL DROP TABLE dbo.Contractors;
IF OBJECT_ID('dbo.Users') IS NOT NULL DROP TABLE dbo.Users;
GO

CREATE TABLE dbo.Users (
  UserId       INT IDENTITY(1,1) PRIMARY KEY,
  FullName     NVARCHAR(100) NOT NULL,
  Username     NVARCHAR(50)  NOT NULL UNIQUE,
  PasswordHash NVARCHAR(200) NOT NULL,
  Role         NVARCHAR(20)  NOT NULL DEFAULT 'Admin' CHECK (Role IN ('Admin','Supervisor')),
  IsActive     BIT NOT NULL DEFAULT 1,
  CreatedAt    DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE dbo.Contractors (
  ContractorId  INT IDENTITY(1,1) PRIMARY KEY,
  Name          NVARCHAR(120) NOT NULL,
  ContactPerson NVARCHAR(100) NULL,
  Phone         NVARCHAR(20)  NULL,
  Email         NVARCHAR(120) NULL,
  Address       NVARCHAR(300) NULL,
  PanNo         NVARCHAR(20)  NULL,
  LicenseNo     NVARCHAR(50)  NULL,
  IsActive      BIT NOT NULL DEFAULT 1,
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE dbo.Clients (
  ClientId      INT IDENTITY(1,1) PRIMARY KEY,
  CompanyName   NVARCHAR(150) NOT NULL,
  ContactPerson NVARCHAR(100) NULL,
  Phone         NVARCHAR(20)  NULL,
  Email         NVARCHAR(120) NULL,
  Address       NVARCHAR(300) NULL,
  City          NVARCHAR(80)  NULL,
  GstNo         NVARCHAR(20)  NULL,
  ContractStart DATE NULL,
  ContractEnd   DATE NULL,
  IsActive      BIT NOT NULL DEFAULT 1,
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE dbo.Sites (
  SiteId         INT IDENTITY(1,1) PRIMARY KEY,
  ClientId       INT NOT NULL REFERENCES dbo.Clients(ClientId),
  SiteName       NVARCHAR(150) NOT NULL,
  Address        NVARCHAR(300) NULL,
  City           NVARCHAR(80)  NULL,
  SupervisorName NVARCHAR(100) NULL,
  RequiredGuards INT NOT NULL DEFAULT 1,
  IsActive       BIT NOT NULL DEFAULT 1,
  CreatedAt      DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);

CREATE TABLE dbo.Guards (
  GuardId       INT IDENTITY(1,1) PRIMARY KEY,
  GuardCode     NVARCHAR(20) NULL UNIQUE,
  FullName      NVARCHAR(120) NOT NULL,
  FatherName    NVARCHAR(120) NULL,
  Phone         NVARCHAR(20)  NOT NULL,
  AltPhone      NVARCHAR(20)  NULL,
  Gender        NVARCHAR(10)  NULL,
  DateOfBirth   DATE NULL,
  Address       NVARCHAR(300) NULL,
  AadhaarNo     NVARCHAR(20)  NULL,
  PanNo         NVARCHAR(20)  NULL,
  BankName      NVARCHAR(100) NULL,
  AccountNo     NVARCHAR(30)  NULL,
  IfscCode      NVARCHAR(20)  NULL,
  UanNo         NVARCHAR(20)  NULL,
  EsicNo        NVARCHAR(20)  NULL,
  PfApplicable  BIT NOT NULL DEFAULT 0,
  EsiApplicable BIT NOT NULL DEFAULT 0,
  MonthlySalary DECIMAL(10,2) NOT NULL DEFAULT 0,
  JoiningDate   DATE NOT NULL DEFAULT CAST(SYSDATETIME() AS DATE),
  ContractorId  INT NULL REFERENCES dbo.Contractors(ContractorId),
  EmergencyContactName  NVARCHAR(100) NULL,
  EmergencyContactPhone NVARCHAR(20)  NULL,
  IsActive      BIT NOT NULL DEFAULT 1,
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE INDEX IX_Guards_Name ON dbo.Guards(FullName);

CREATE TABLE dbo.Deployments (
  DeploymentId INT IDENTITY(1,1) PRIMARY KEY,
  GuardId   INT NOT NULL REFERENCES dbo.Guards(GuardId),
  SiteId    INT NOT NULL REFERENCES dbo.Sites(SiteId),
  Shift     NVARCHAR(10) NOT NULL DEFAULT 'Day' CHECK (Shift IN ('Day','Night','General')),
  StartDate DATE NOT NULL,
  EndDate   DATE NULL,
  IsActive  BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
CREATE INDEX IX_Deployments_Guard ON dbo.Deployments(GuardId, IsActive);
CREATE INDEX IX_Deployments_Site  ON dbo.Deployments(SiteId, IsActive);

CREATE TABLE dbo.Attendance (
  AttendanceId INT IDENTITY(1,1) PRIMARY KEY,
  GuardId   INT NOT NULL REFERENCES dbo.Guards(GuardId),
  SiteId    INT NOT NULL REFERENCES dbo.Sites(SiteId),
  AttDate   DATE NOT NULL,
  Status    NVARCHAR(3) NOT NULL CHECK (Status IN ('P','A','HD','L','WO')),
  OtHours   DECIMAL(4,1) NOT NULL DEFAULT 0,
  Remarks   NVARCHAR(200) NULL,
  MarkedBy  INT NULL REFERENCES dbo.Users(UserId),
  CONSTRAINT UQ_Attendance UNIQUE (GuardId, AttDate)
);
CREATE INDEX IX_Attendance_Date ON dbo.Attendance(AttDate, SiteId);

CREATE TABLE dbo.Payments (
  PaymentId    INT IDENTITY(1,1) PRIMARY KEY,
  GuardId      INT NOT NULL REFERENCES dbo.Guards(GuardId),
  PayMonth     TINYINT NOT NULL,
  PayYear      SMALLINT NOT NULL,
  MonthlySalary DECIMAL(10,2) NOT NULL,
  PayableDays  DECIMAL(5,1) NOT NULL,
  OtHours      DECIMAL(6,1) NOT NULL DEFAULT 0,
  EarnedAmount DECIMAL(10,2) NOT NULL,
  OtAmount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  GrossAmount  DECIMAL(10,2) NOT NULL,
  PfAmount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  EsiAmount    DECIMAL(10,2) NOT NULL DEFAULT 0,
  AdvanceDeduction DECIMAL(10,2) NOT NULL DEFAULT 0,
  OtherDeduction   DECIMAL(10,2) NOT NULL DEFAULT 0,
  NetAmount    DECIMAL(10,2) NOT NULL,
  Status       NVARCHAR(10) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending','Paid')),
  PaidOn       DATE NULL,
  PaymentMode  NVARCHAR(20) NULL,
  ReferenceNo  NVARCHAR(50) NULL,
  Remarks      NVARCHAR(200) NULL,
  CONSTRAINT UQ_Payments UNIQUE (GuardId, PayMonth, PayYear)
);
GO

/* ---------- Sample data (delete if not needed) ---------- */
INSERT INTO dbo.Contractors (Name, ContactPerson, Phone) VALUES
 (N'Shree Manpower Services', N'Ramesh Patel', N'9876500001'),
 (N'Direct (Own Payroll)', N'Neha Industrial Security', N'9876500002');

INSERT INTO dbo.Clients (CompanyName, ContactPerson, Phone, City, GstNo, ContractStart) VALUES
 (N'Sunrise Textiles Pvt Ltd', N'Mr. Mehta', N'9825000001', N'Surat', N'24ABCDE1234F1Z5', '2026-04-01'),
 (N'Gujarat Chemicals Ltd',    N'Mr. Shah',  N'9825000002', N'Surat', N'24PQRSX5678L1Z2', '2026-04-01');

INSERT INTO dbo.Sites (ClientId, SiteName, City, RequiredGuards) VALUES
 (1, N'Sunrise Main Gate', N'Surat', 2),
 (1, N'Sunrise Warehouse', N'Surat', 1),
 (2, N'GCL Plant Gate 1', N'Surat', 3);

INSERT INTO dbo.Guards (FullName, Phone, MonthlySalary, PfApplicable, ContractorId, JoiningDate) VALUES
 (N'Ramesh Kumar', N'9000000001', 12000, 1, 2, '2026-04-01'),
 (N'Suresh Yadav', N'9000000002', 12000, 1, 2, '2026-04-01'),
 (N'Mahesh Singh', N'9000000003', 11000, 0, 1, '2026-04-05'),
 (N'Dinesh Rathod', N'9000000004', 11500, 0, 1, '2026-05-01');
UPDATE dbo.Guards SET GuardCode = 'NSG-' + RIGHT('0000' + CAST(GuardId AS VARCHAR(10)), 4);

INSERT INTO dbo.Deployments (GuardId, SiteId, Shift, StartDate) VALUES
 (1, 1, 'Day', '2026-04-01'), (2, 1, 'Night', '2026-04-01'), (3, 3, 'Day', '2026-04-05');
GO
