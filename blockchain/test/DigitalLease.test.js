const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("DigitalLease", function () {
  let digitalLease;
  let owner, tenant1, tenant2;
  const RENT_AMOUNT = ethers.parseEther("0.05");
  const LEASE_DURATION_DAYS = 30;
  const PENALTY_RATE = 10;
  const GRACE_PERIOD_HOURS = 24;

  beforeEach(async function () {
    [owner, tenant1, tenant2] = await ethers.getSigners();

    const DigitalLease = await ethers.getContractFactory("DigitalLease");
    digitalLease = await DigitalLease.deploy(
      RENT_AMOUNT,
      LEASE_DURATION_DAYS,
      PENALTY_RATE,
      GRACE_PERIOD_HOURS
    );
    await digitalLease.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Harus set owner dengan benar", async function () {
      expect(await digitalLease.owner()).to.equal(owner.address);
    });

    it("Harus set parameter sewa dengan benar", async function () {
      expect(await digitalLease.rentAmount()).to.equal(RENT_AMOUNT);
      expect(await digitalLease.leaseDuration()).to.equal(LEASE_DURATION_DAYS * 24 * 60 * 60);
      expect(await digitalLease.penaltyRate()).to.equal(PENALTY_RATE);
    });
  });

  describe("Registrasi Penyewa", function () {
    it("Owner bisa mendaftarkan penyewa", async function () {
      await expect(
        digitalLease.registerTenant(tenant1.address, "Ahmad", 101)
      ).to.emit(digitalLease, "TenantRegistered")
        .withArgs(tenant1.address, "Ahmad", 101);

      const details = await digitalLease.getTenantDetails(tenant1.address);
      expect(details.name).to.equal("Ahmad");
      expect(details.roomNumber).to.equal(101);
      expect(details.isRegistered).to.be.true;
    });

    it("Non-owner tidak bisa mendaftarkan penyewa", async function () {
      await expect(
        digitalLease.connect(tenant1).registerTenant(tenant2.address, "Budi", 102)
      ).to.be.revertedWith("Hanya pemilik yang diizinkan");
    });

    it("Tidak bisa mendaftarkan penyewa yang sudah terdaftar", async function () {
      await digitalLease.registerTenant(tenant1.address, "Ahmad", 101);
      await expect(
        digitalLease.registerTenant(tenant1.address, "Ahmad", 101)
      ).to.be.revertedWith("Penyewa sudah terdaftar");
    });
  });

  describe("Pembayaran Sewa", function () {
    beforeEach(async function () {
      await digitalLease.registerTenant(tenant1.address, "Ahmad", 101);
    });

    it("Penyewa bisa membayar sewa", async function () {
      await expect(
        digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT })
      ).to.emit(digitalLease, "RentPaid");

      const [isActive, endTime] = await digitalLease.getLeaseStatus(tenant1.address);
      expect(isActive).to.be.true;
      expect(endTime).to.be.gt(0);
    });

    it("Pembayaran kurang harus ditolak", async function () {
      await expect(
        digitalLease.connect(tenant1).payRent({ value: ethers.parseEther("0.01") })
      ).to.be.revertedWith("Jumlah pembayaran kurang");
    });

    it("Penyewa belum terdaftar tidak bisa bayar", async function () {
      await expect(
        digitalLease.connect(tenant2).payRent({ value: RENT_AMOUNT })
      ).to.be.revertedWith("Penyewa belum terdaftar");
    });

    it("Perpanjangan sebelum jatuh tempo menambah durasi", async function () {
      await digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT });
      const [, endTime1] = await digitalLease.getLeaseStatus(tenant1.address);

      // Bayar lagi sebelum jatuh tempo (15 hari kemudian)
      await time.increase(15 * 24 * 60 * 60);
      await digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT });
      const [, endTime2] = await digitalLease.getLeaseStatus(tenant1.address);

      // endTime2 harus = endTime1 + 30 hari
      const expected = endTime1 + BigInt(30 * 24 * 60 * 60);
      expect(endTime2).to.equal(expected);
    });
  });

  describe("Denda Keterlambatan", function () {
    beforeEach(async function () {
      await digitalLease.registerTenant(tenant1.address, "Ahmad", 101);
      await digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT });
    });

    it("Tidak ada denda dalam masa tenggang", async function () {
      // Lewati 30 hari + 12 jam (masih dalam grace period 24 jam)
      await time.increase(30 * 24 * 60 * 60 + 12 * 60 * 60);
      const penalty = await digitalLease.getCurrentPenalty(tenant1.address);
      expect(penalty).to.equal(0);
    });

    it("Ada denda setelah masa tenggang", async function () {
      // Lewati 30 hari + 25 jam (melewati grace period)
      await time.increase(30 * 24 * 60 * 60 + 25 * 60 * 60);
      const penalty = await digitalLease.getCurrentPenalty(tenant1.address);
      const expectedPenalty = (RENT_AMOUNT * BigInt(PENALTY_RATE)) / 100n;
      expect(penalty).to.equal(expectedPenalty);
    });

    it("Bayar dengan denda harus cukup", async function () {
      // Lewati 32 hari (melewati grace period)
      await time.increase(32 * 24 * 60 * 60);
      
      const penalty = (RENT_AMOUNT * BigInt(PENALTY_RATE)) / 100n;
      const totalRequired = RENT_AMOUNT + penalty;

      // Bayar tanpa denda → gagal
      await expect(
        digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT })
      ).to.be.revertedWith("Jumlah pembayaran kurang");

      // Bayar dengan denda → sukses
      await expect(
        digitalLease.connect(tenant1).payRent({ value: totalRequired })
      ).to.emit(digitalLease, "PenaltyPaid")
        .and.to.emit(digitalLease, "RentPaid");
    });
  });

  describe("Kontrol Akses Pintu (Owner Override)", function () {
    beforeEach(async function () {
      await digitalLease.registerTenant(tenant1.address, "Ahmad", 101);
      await digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT });
    });

    it("Owner bisa mengunci akses penyewa", async function () {
      await expect(
        digitalLease.overrideDoorAccess(tenant1.address, true)
      ).to.emit(digitalLease, "DoorAccessOverride")
        .withArgs(tenant1.address, true)
        .and.to.emit(digitalLease, "LeaseExpired");

      const [isActive] = await digitalLease.getLeaseStatus(tenant1.address);
      expect(isActive).to.be.false;
    });

    it("Owner bisa membuka akses penyewa", async function () {
      await digitalLease.overrideDoorAccess(tenant1.address, true);
      await digitalLease.overrideDoorAccess(tenant1.address, false);

      const [isActive] = await digitalLease.getLeaseStatus(tenant1.address);
      expect(isActive).to.be.true;
    });
  });

  describe("Penarikan Dana", function () {
    it("Owner bisa menarik dana dari kontrak", async function () {
      await digitalLease.registerTenant(tenant1.address, "Ahmad", 101);
      await digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT });

      const balanceBefore = await ethers.provider.getBalance(owner.address);
      
      await expect(
        digitalLease.withdrawFunds()
      ).to.emit(digitalLease, "FundsWithdrawn");

      const balanceAfter = await ethers.provider.getBalance(owner.address);
      expect(balanceAfter).to.be.gt(balanceBefore);
    });
  });

  describe("Status Sewa Expired", function () {
    it("isActive false setelah jatuh tempo", async function () {
      await digitalLease.registerTenant(tenant1.address, "Ahmad", 101);
      await digitalLease.connect(tenant1).payRent({ value: RENT_AMOUNT });

      // Lewati 31 hari
      await time.increase(31 * 24 * 60 * 60);

      const [isActive] = await digitalLease.getLeaseStatus(tenant1.address);
      expect(isActive).to.be.false;
    });
  });
});
