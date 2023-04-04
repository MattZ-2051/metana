
# EVM puzzles



A collection of EVM puzzles. Each puzzle consists on sending a successful transaction to a contract. The bytecode of the contract is provided, and you need to fill the transaction data that won't revert the execution.



## How to play



Clone this repository and install its dependencies (`npm install` or `yarn`). Then run:



```

npx hardhat play

```



And the game will start.



In some puzzles you only need to provide the value that will be sent to the contract, in others the calldata, and in others both values.



You can use [`evm.codes`](https://www.evm.codes/)'s reference and playground to work through this.




# Solutions



## Puzzle 1
```
00  34 CALLVALUE
01  56 JUMP
02  FD REVERT
03  FD REVERT
04  FD REVERT
05  FD REVERT
06  FD REVERT
07  FD REVERT
08  5B JUMPDEST
09  00 STOP
```

Solution: 8

Explanation :
- CALLVALUE will push the amount sent with the transaction on top of the stack (in this case 8)
- JUMP then will the number on top of the stack and modify the PC to fit this number instead of incrementing it by 1 like most operations.

## Puzzle 2
```
00 34  CALLVALUE
01 38  CODESIZE
02 03  SUB
03 56  JUMP
04  FD REVERT
05  FD REVERT
06  5B JUMPDEST
07  00 STOP
08  FD REVERT
09  FD REVERT
```

Solution: 4

Explanation:
- CALLVALUE will push the amount sent with the transaction on top of the stack (in this case 4)
- CODESIZE will push the size of the code onto the stack (in this case it is "a")
- SUB will take the top two values on the stack and subtract first from second in this case a - 4 OR 10 - 4 = 6
- JUMP will take 6 and jump to the JUMPDEST which is at 06
