# ForenChain – Blockchain-Based Chain of Custody Management System for Digital Forensics

## Overview
ForenChain is a web-based digital forensic evidence management system developed to support secure, traceable, and tamper-evident handling of digital evidence. The system was designed to simulate real-world forensic workflows by supporting multiple user roles, including administrator, investigator, supervisor, analyst, and prosecutor.

The main purpose of the system is to preserve the integrity of digital evidence throughout its lifecycle. To achieve this, the system combines internal **SHA-256 hash chaining** with external **blockchain anchoring** on the Ethereum Sepolia test network. This hybrid approach enables both efficient local record management and independent external verification.

---

## Project Aim
The aim of this project was to design and implement a secure Chain of Custody Management System for Digital Forensics that ensures reliable tracking, verification, and documentation of digital evidence handling operations.

---

## Project Objectives
- To develop a web-based digital evidence management system that records and tracks the chain of custody throughout every stage of the evidence lifecycle.
- To implement a secure mechanism for recording evidence handling processes in order to reduce the possibility of records being altered or manipulated without authorisation.
- To enforce role-based access controls for investigators, supervisors, analysts, prosecutors, and administrators in order to simulate actual forensic workflows.
- To provide clear evidence verification tools that enable users to evaluate and validate the history of custody events.
- To implement comprehensive audit logging to record system operations and ensure user accountability.

---

## Key Features

### Authentication and Access Control
- Username and password login
- Registered phone number verification
- OTP verification
- Session-based authentication
- Role-based access control using middleware

### Evidence Management
- Evidence registration by investigator
- File upload and evidence metadata storage
- Unique case ID generation
- Evidence status tracking across lifecycle stages

### Chain of Custody Tracking
- Genesis block creation during evidence collection
- Sequential chain record generation for major custody events
- `previous_hash` and `data_hash` linking for tamper detection

### Blockchain Integration
- Smart contract deployment on Ethereum Sepolia
- Blockchain event logging through `logEvent()`
- Transaction hash storage in database
- Independent verification through blockchain explorer

### Forensic Analysis and Reporting
- Analysis drafting and updating by analyst
- PDF forensic report generation
- Report hashing using SHA-256
- Report finalisation and locking

### Verification and Audit
- Prosecutor blockchain verification view
- Internal hash chain verification
- Blockchain hash comparison
- Audit logging of important system events

### Administrative Support
- User management
- Audit log viewing
- Database backup creation
- Database restore functionality

---

## System Roles

### Administrator
- Create and manage users
- View audit logs
- Create and restore database backups

### Investigator
- Add new evidence
- Upload digital evidence files
- View own submitted evidence
- Transfer approved evidence to analyst
- Edit and resubmit rejected evidence

### Supervisor
- Review and approve evidence
- Reject evidence with reason
- Review analyst output
- Approve analysis with supporting validation material

### Analyst
- View transferred evidence
- Record forensic analysis
- Generate and finalise forensic reports
- Transfer validated evidence to prosecutor

### Prosecutor
- View completed cases
- Review chain of custody history
- Verify blockchain-linked records
- Export chain of custody PDF report

---

## Technology Stack

### Frontend
- HTML
- CSS
- JavaScript
- EJS

### Backend
- Node.js
- Express.js

### Database
- MySQL

### Blockchain
- Solidity
- Ethereum Sepolia Testnet
- Ethers.js
- Infura
- MetaMask
- Remix IDE

### Other Tools
- Visual Studio Code
- GitHub
- PDFKit
- bcrypt
- express-session
- express-rate-limit
- validator

---

## Architecture
The system follows a layered client-server architecture:

1. **Presentation Layer**  
   Role-based web interfaces built using EJS, HTML, CSS, and JavaScript.

2. **Application Layer**  
   Express.js controllers and middleware handling authentication, workflow logic, validation, report generation, and verification.

3. **Data Layer**  
   MySQL database storing users, evidence, evidence chain, forensic reports, transfers, backup logs, and audit logs.

4. **Blockchain Layer**  
   Smart contract on Ethereum Sepolia storing immutable custody event references for external verification.

---

## Database Tables
The system uses the following main database tables:

- `users`
- `evidence`
- `evidence_chain`
- `forensic_analysis`
- `forensic_reports`
- `transfers`
- `audit_logs`
- `backup_logs`

---

## Installation & Running

### 1. Clone Repository
git clone https://github.com/your-username/forenchain.git
cd forenchain

### 2. Install Dependencies
npm install

### 3. Run Server
node server.js

### 4. Access System
http://localhost:3000

---

## How the Verification Works

### 1. File Integrity
When evidence is uploaded, the system reads the file and generates a SHA-256 file hash.

### 2. Chain Integrity
Each important custody event generates a new `data_hash` using:
- previous hash
- evidence ID
- action
- actor ID
- timestamp
- extra event-specific data

This creates a linked chain where modification of a prior record invalidates later records.

### 3. Blockchain Anchoring
The generated `data_hash` is passed to the smart contract and recorded on Ethereum Sepolia.  
The returned blockchain transaction hash (`tx_hash`) is stored in the database.

### 4. Verification
During prosecutor review, the system:
- checks whether each block is linked correctly using `previous_hash`
- fetches blockchain events for the evidence ID
- compares on-chain `dataHash` with database `data_hash`
- marks the record as `Verified`, `Tampered`, or `Not Anchored`

---

## Project Structure

```text
ForenChain/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── authController.js
│   ├── adminController.js
│   ├── evidenceController.js
│   ├── supervisorController.js
│   ├── analystController.js
│   └── prosecutorController.js
│
├── middleware/
│   ├── authMiddleware.js
│   ├── roleMiddleware.js
│   └── rateLimit.js
│
├── models/
│   └── AuditLog.js
│
├── routes/
│   ├── authRoutes.js
│   ├── adminRoutes.js
│   ├── evidenceRoutes.js
│   ├── supervisorRoutes.js
│   ├── analystRoutes.js
│   └── prosecutorRoutes.js
│
├── utils/
│   ├── blockchain.js
│   ├── blockchainLogger.js
│   ├── fileHash.js
│   ├── hashChain.js
│   └── logger.js
│
├── views/
│   ├── login.ejs
│   ├── verifyPhone.ejs
│   ├── otp.ejs
│   ├── investigator/
│   ├── supervisor/
│   ├── analyst/
│   ├── prosecutor/
│   └── administrator/
│
├── uploads/
│   ├── evidence_photos/
│   └── reports/
│
├── public/
│   └── reports/
│
├── contracts/
│   └── ChainOfCustody.sol
│
├── .env
├── package.json
├── server.js
└── README.md
