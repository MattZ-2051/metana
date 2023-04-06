
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

Solution: `8`

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

Solution: `4`

Explanation:
- CALLVALUE will push the amount sent with the transaction on top of the stack (in this case 4)
- CODESIZE will push the size of the code onto the stack (in this case it is "a")
- SUB will take the top two values on the stack and subtract first from second in this case a - 4 OR 10 - 4 = 6
- JUMP will take 6 and jump to the JUMPDEST which is at 06

## Puzzle 3
```
00 36  CALLDATASIZE
01 56  JUMP
02  FD REVERT
03  FD REVERT
04  5B JUMPDEST
05  00 STOP
```

Solution: `0x01010101` (4 bytes)

Explanation:
- CALLDATASIZE will take the size of the call data in bytes and push that on stack so in this case we need to send call data with a value of 4 bytes to get to our destination

## Puzzle 4

```
00 34  CALLVALUE
01 38  CODESIZE
02 18  XOR
03 56  JUMP
04  FD REVERT
05  FD REVERT
06  FD REVERT
07  FD REVERT
08  FD REVERT
09  FD REVERT
0A  5B JUMPDEST
0B  00 STOP
```

Solution: `6`

Explanation:
- CALLVALUE will push value sent onto the stack (in this case 6)
- CODESIZE will take the size of the code and push that on the stack (in this case 12)
- XOR pops the first two values on the stack and computes the bitwise XOR and returns the result a ^ b. In this case we want it to return 10 or 0a since that is hte JUMPDEST and the next operation is the JUMP. (In this case 12 ^ 6 = 10)


## Puzzle 5
```
00  34  CALLVALUE
01  80  DUP1
02  02  MUL
03  610100  PUSH2 0100
06  14  EQ
07  600C  PUSH1 0C
09  57  JUMPI
0A  FD REVERT
0B  FD REVERT
0C  5B JUMPDEST
0D  00 STOP
0E  FD REVERT
0F  FD REVERT
```

Solution: `16`

Explanation:
- CALLVALUE will take value sent and push it into stack (in this case 16)
- DUP1 will take the value on top of the stack and pushes it on top (in this case 10 or 16 in hex form)
- MUL will pop the first two values of the stack and multiply them together (10 * 10)
- PUSH2 will push two bytes on top of the stack (0100)
- EQ checks if the first two values on the stack are equal and pushes 1 if they are and 0 if they are not (in this case it will return a 1 because the two values on the stack are 100)
- PUSH1 will push 1 byte item onto the stack (0c)
- JUMPI jumps to the instruction on the stack if the second value is different from 0

## Puzzle 6
```
00 6000  PUSH1 00
02 35  CALLDATALOAD
03 56  JUMP
04  FD REVERT
05  FD REVERT
06  FD REVERT
07  FD REVERT
08  FD REVERT
09  FD REVERT
0A  5B JUMPDEST
0B  00 STOP
```
Solution:  `0x000000000000000000000000000000000000000000000000000000000000000A`

Explanation:
- PUSH1 will push `00` on the call stack
- CALLDATALOAD pops the calldata from the stack and pushes the result on top which is a 32-byte value starting from the given offset of the calldata. All bytes after the end of the end of the calldata are set to 0. So we need to pass in the leading zeroes in our solution to make it a 32 byte value. If we just passed in `0x0a` which is the destination we are trying to jump to. CALLDATALOAD would return `0x0A00000000000000000000000000000000000000000000000000000000000000`
- JUMP at this point `0a` is on the stack because of the value returned from CALLDATALOAD so we can jump to the correct destination

## Puzzle 7
```
00 36  CALLDATASIZE
01 6000  PUSH1 00
03 80  DUP1
04 37  CALLDATACOPY
05 36  CALLDATASIZE
06 6000  PUSH1 00
08 6000  PUSH1 00
0A F0  CREATE
0B 3B  EXTCODESIZE
0C 6001  PUSH1 01
0E 14  EQ
0F 6013  PUSH1 13
11 57  JUMPI
12  FD REVERT
13  5B JUMPDEST
14  00 STOP
```

Solution: `0x6001600C60003960016000F3ff`

Explanation:

- CALLDATASIZE will push the size of the call data in bytes onto the stack
- PUSH1 will push a 1 byte item onto the stack (in this case 00)
- DUP1 will take the value on the top of the stack and duplicate
- CALLDATACOPY will copy the current input data to memory, input values it uses from the stack are
	1.  `destOffset`: byte offset in the  memory where the result will be copied.
	2.  `offset`: byte offset in the  calldata to copy.
	3.  `size`: byte size to copy.
- CREATE - Creates a new contract. Enters a new sub  context of the calculated destination address and executes the provided initialization code, then resumes the current context. Should deployment succeed, the new account's  code is set to the  return data  resulting from executing the initialization code. The destination address is calculated as the rightmost 20 bytes (160 bits) of the Keccak-256 hash of the rlp encoding of the sender address followed by its nonce.
	1.  `value`: value in wei to send to the new account.
	2.  `offset`: byte offset in the memory in bytes, the initialisation code for the new account.
	3.  `size`: byte size to copy (size of the initialization code).

- EXITCODESIZE - takes the 20 byte address of the contract to query and returns the byte size of the code, in this case we want it to return 1 byte
- To solve this we want EXITCODESIZE to return  0 so when PUSH 01 is executed the EQ returns a 0 because the 2 number on the stack 0 and 1 are not equal. Then when it reaches PUSH1 13 it will have the correct number on the stack when JUMPI is called and jumps to 13 since the value is different from 0
