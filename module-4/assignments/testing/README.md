
# Week 4 Testing Write up



### False Positives found



### 1. Return Value

- issue with return value on, before I wasn't returning anything but slither recommended returning the value from the inherited transfer function



` function withdrawTokens() external onlyOwner returns (bool) {

return this.transfer(owner, balanceOf(address(this)));

}`



Reentrancy warnings found on PartialRefund sellBack function



- Before Slither



```

function sellBack(uint256 amount) external nonReentrant {

require(balanceOf(msg.sender) >= amount, "Not enough tokens");

if (amount >= 1000 * (10 ** 18)) {

uint256 ethToTransfer = ((amount / (1000 * (10 ** 18))) *

(10 ** 18)) / 2;

require(

address(this).balance >= ethToTransfer,

"Not enough eth in contract sell less tokens");

payable(msg.sender).transfer(ethToTransfer);

}

transferFrom(msg.sender, address(this), amount);

}

```



- After Slither

call transferFrom at beginning of function and add nonReentrant guard to function



```

function sellBack(uint256 amount) external nonReentrant {

require(balanceOf(msg.sender) >= amount, "Not enough tokens");

transferFrom(msg.sender, address(this), amount);

if (amount >= 1000 * (10 ** 18)) {

uint256 ethToTransfer = ((amount / (1000 * (10 ** 18))) *

(10 ** 18)) / 2;

require(address(this).balance >= ethToTransfer,

"Not enough eth in contract sell less tokens");

payable(msg.sender).transfer(ethToTransfer);

}

}

```



### 2. Reentrancy warnings found on Forge mint function



- Before Slither



```

function mint(uint256 _id) external {

require(_id <= 2, "can only mint token ids 0-2 with this function");

require(

mintTimer + 1 minutes <= block.timestamp,

"must wait 1 minute before minting again"

);

myToken.mintTo(msg.sender, _id);

mintTimer = block.timestamp;

}

```



- After Slither

update mintTimer before external mintTo function is called and add reentrant guard



```

function mint(uint256 _id) external nonReentrant {

require(_id <= 2, "can only mint token ids 0-2 with this function");

require(

mintTimer + 1 minutes <= block.timestamp,

"must wait 1 minute before minting again"

);

mintTimer = block.timestamp;

myToken.mintTo(msg.sender, _id);

}

```



### 3. Slither recommended adding a constant to the maxSupply variable in partial refund

`uint256 public constant maxSupply = 100000000 * (10 ** 18);`
