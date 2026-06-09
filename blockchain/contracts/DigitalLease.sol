// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title DigitalLease
 * @dev Sistem Manajemen Sewa Kost Terdesentralisasi
 * 
 * Fitur:
 * - Registrasi penyewa oleh pemilik properti
 * - Pembayaran sewa otomatis via smart contract
 * - Pengenaan denda keterlambatan berbasis block.timestamp
 * - Emisi event untuk integrasi IoT (kunci pintu)
 */
contract DigitalLease {
    // ============ State Variables ============

    address public owner;
    uint256 public rentAmount;       // Jumlah sewa bulanan (dalam Wei)
    uint256 public leaseDuration;    // Durasi sewa per pembayaran (dalam detik, default 30 hari)
    uint256 public penaltyRate;      // Persentase denda (misal: 10 = 10%)
    uint256 public gracePeriod;      // Masa tenggang sebelum denda (dalam detik)

    struct Tenant {
        address wallet;
        string name;
        uint256 roomNumber;
        uint256 leaseStart;
        uint256 leaseEnd;
        bool isActive;
        bool isRegistered;
        uint256 totalPaid;
        uint256 totalPenalties;
    }

    mapping(address => Tenant) public tenants;
    address[] public tenantList;

    // ============ Events ============

    event TenantRegistered(address indexed tenant, string name, uint256 roomNumber);
    event RentPaid(address indexed tenant, uint256 amount, uint256 newEndTime);
    event PenaltyPaid(address indexed tenant, uint256 penaltyAmount);
    event LeaseExpired(address indexed tenant);
    event TenantRemoved(address indexed tenant);
    event DoorAccessOverride(address indexed tenant, bool locked);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event RentAmountUpdated(uint256 oldAmount, uint256 newAmount);

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Hanya pemilik yang diizinkan");
        _;
    }

    modifier onlyRegistered() {
        require(tenants[msg.sender].isRegistered, "Penyewa belum terdaftar");
        _;
    }

    // ============ Constructor ============

    /**
     * @param _rentAmount Jumlah sewa dalam Wei
     * @param _leaseDurationDays Durasi sewa per pembayaran dalam hari
     * @param _penaltyRate Persentase denda keterlambatan (misal: 10 = 10%)
     * @param _gracePeriodHours Masa tenggang dalam jam sebelum denda berlaku
     */
    constructor(
        uint256 _rentAmount,
        uint256 _leaseDurationDays,
        uint256 _penaltyRate,
        uint256 _gracePeriodHours
    ) {
        owner = msg.sender;
        rentAmount = _rentAmount;
        leaseDuration = _leaseDurationDays * 1 days;
        penaltyRate = _penaltyRate;
        gracePeriod = _gracePeriodHours * 1 hours;
    }

    // ============ Owner Functions ============

    /**
     * @dev Mendaftarkan penyewa baru
     * @param _tenant Alamat wallet penyewa
     * @param _name Nama penyewa
     * @param _roomNumber Nomor kamar
     */
    function registerTenant(
        address _tenant,
        string calldata _name,
        uint256 _roomNumber
    ) external onlyOwner {
        require(!tenants[_tenant].isRegistered, "Penyewa sudah terdaftar");
        require(_tenant != address(0), "Alamat tidak valid");

        tenants[_tenant] = Tenant({
            wallet: _tenant,
            name: _name,
            roomNumber: _roomNumber,
            leaseStart: 0,
            leaseEnd: 0,
            isActive: false,
            isRegistered: true,
            totalPaid: 0,
            totalPenalties: 0
        });

        tenantList.push(_tenant);
        emit TenantRegistered(_tenant, _name, _roomNumber);
    }

    /**
     * @dev Menghapus penyewa dari sistem
     * @param _tenant Alamat wallet penyewa
     */
    function removeTenant(address _tenant) external onlyOwner {
        require(tenants[_tenant].isRegistered, "Penyewa tidak ditemukan");
        
        tenants[_tenant].isRegistered = false;
        tenants[_tenant].isActive = false;
        
        // Hapus dari array
        for (uint256 i = 0; i < tenantList.length; i++) {
            if (tenantList[i] == _tenant) {
                tenantList[i] = tenantList[tenantList.length - 1];
                tenantList.pop();
                break;
            }
        }
        
        emit TenantRemoved(_tenant);
        emit LeaseExpired(_tenant);
    }

    /**
     * @dev Override kontrol akses pintu oleh pemilik
     * @param _tenant Alamat wallet penyewa
     * @param _lock true = kunci, false = buka
     */
    function overrideDoorAccess(address _tenant, bool _lock) external onlyOwner {
        require(tenants[_tenant].isRegistered, "Penyewa tidak ditemukan");
        
        if (_lock) {
            tenants[_tenant].isActive = false;
            emit LeaseExpired(_tenant);
        } else {
            tenants[_tenant].isActive = true;
        }
        
        emit DoorAccessOverride(_tenant, _lock);
    }

    /**
     * @dev Tarik dana dari kontrak
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "Tidak ada dana untuk ditarik");
        
        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Penarikan gagal");
        
        emit FundsWithdrawn(owner, balance);
    }

    /**
     * @dev Update jumlah sewa
     * @param _newAmount Jumlah sewa baru dalam Wei
     */
    function updateRentAmount(uint256 _newAmount) external onlyOwner {
        require(_newAmount > 0, "Jumlah sewa harus > 0");
        uint256 oldAmount = rentAmount;
        rentAmount = _newAmount;
        emit RentAmountUpdated(oldAmount, _newAmount);
    }

    // ============ Tenant Functions ============

    /**
     * @dev Membayar sewa. Jika telat, wajib bayar sewa + denda.
     */
    function payRent() external payable onlyRegistered {
        Tenant storage tenant = tenants[msg.sender];
        
        uint256 requiredAmount = rentAmount;
        uint256 penalty = 0;

        // Cek apakah ada keterlambatan & denda
        if (tenant.leaseEnd > 0 && block.timestamp > tenant.leaseEnd + gracePeriod) {
            penalty = (rentAmount * penaltyRate) / 100;
            requiredAmount = rentAmount + penalty;
        }

        require(msg.value >= requiredAmount, "Jumlah pembayaran kurang");

        // Update status sewa
        if (tenant.leaseEnd > 0 && block.timestamp <= tenant.leaseEnd) {
            // Perpanjangan sebelum jatuh tempo
            tenant.leaseEnd += leaseDuration;
        } else {
            // Sewa baru atau setelah jatuh tempo
            tenant.leaseStart = block.timestamp;
            tenant.leaseEnd = block.timestamp + leaseDuration;
        }

        tenant.isActive = true;
        tenant.totalPaid += msg.value;

        if (penalty > 0) {
            tenant.totalPenalties += penalty;
            emit PenaltyPaid(msg.sender, penalty);
        }

        emit RentPaid(msg.sender, msg.value, tenant.leaseEnd);

        // Refund kelebihan pembayaran
        if (msg.value > requiredAmount) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - requiredAmount}("");
            require(success, "Refund gagal");
        }
    }

    // ============ View Functions ============

    /**
     * @dev Mendapatkan status sewa penyewa
     * @param _tenant Alamat wallet penyewa
     * @return isActive Status aktif sewa
     * @return endTime Waktu berakhir sewa (unix timestamp)
     */
    function getLeaseStatus(address _tenant) external view returns (bool isActive, uint256 endTime) {
        Tenant memory tenant = tenants[_tenant];
        
        if (!tenant.isRegistered) {
            return (false, 0);
        }

        // Cek apakah sewa sudah melewati jatuh tempo
        bool active = tenant.isActive && block.timestamp <= tenant.leaseEnd;
        return (active, tenant.leaseEnd);
    }

    /**
     * @dev Mendapatkan detail lengkap penyewa
     * @param _tenant Alamat wallet penyewa
     */
    function getTenantDetails(address _tenant) external view returns (
        string memory name,
        uint256 roomNumber,
        uint256 leaseStart,
        uint256 leaseEnd,
        bool isActive,
        bool isRegistered,
        uint256 totalPaid,
        uint256 totalPenalties
    ) {
        Tenant memory t = tenants[_tenant];
        bool active = t.isActive && (t.leaseEnd == 0 || block.timestamp <= t.leaseEnd);
        return (t.name, t.roomNumber, t.leaseStart, t.leaseEnd, active, t.isRegistered, t.totalPaid, t.totalPenalties);
    }

    /**
     * @dev Mendapatkan jumlah denda saat ini untuk penyewa
     * @param _tenant Alamat wallet penyewa
     */
    function getCurrentPenalty(address _tenant) external view returns (uint256) {
        Tenant memory tenant = tenants[_tenant];
        if (tenant.leaseEnd > 0 && block.timestamp > tenant.leaseEnd + gracePeriod) {
            return (rentAmount * penaltyRate) / 100;
        }
        return 0;
    }

    /**
     * @dev Mendapatkan jumlah total penyewa terdaftar
     */
    function getTenantCount() external view returns (uint256) {
        return tenantList.length;
    }

    /**
     * @dev Mendapatkan alamat penyewa berdasarkan indeks
     * @param _index Indeks dalam array tenantList
     */
    function getTenantByIndex(uint256 _index) external view returns (address) {
        require(_index < tenantList.length, "Index di luar batas");
        return tenantList[_index];
    }

    /**
     * @dev Mendapatkan saldo kontrak
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // ============ Fallback ============

    receive() external payable {}
}
