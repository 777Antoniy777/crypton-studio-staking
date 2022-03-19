// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Token is Ownable {
    string private constant NAME = "TonyToken";
    string private constant SYMBOL = "TT";
    uint8 private constant DECIMALS = 18;
    uint256 private totalCount;

    mapping(address => uint256) private balances;
    mapping(address => mapping(address => uint256)) private allowed;

    constructor(uint256 tokenInitialCount) {
        totalCount = tokenInitialCount;
        balances[msg.sender] = tokenInitialCount;
    }

    // events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed allower, address indexed spender, uint256 value);

    function name() public view returns (string memory) {
        return NAME;
    }

    function symbol() public view returns (string memory) {
        return SYMBOL;
    }

    function decimals() public view returns (uint8) {
        return DECIMALS;
    }

    function totalSupply() public view returns (uint256) {
        return totalCount;
    }

    function balanceOf(address userAddress) public view returns (uint256 balance) {
        return balances[userAddress];
    }

    function transfer(address receiverAddress, uint256 value) public returns (bool success) {
        require(value <= balances[msg.sender], "Your balance is less than needle");

        balances[msg.sender] = balances[msg.sender] - value;
        balances[receiverAddress] = balances[receiverAddress] + value;

        emit Transfer(msg.sender, receiverAddress, value);

        return true;
    }

    function transferFrom(
        address senderAddress,
        address receiverAddress,
        uint256 value
    ) public returns (bool success) {
        require(value <= balances[senderAddress], "Your balance is less than needle");
        require(
            value <= allowed[senderAddress][msg.sender],
            "You cant transfer because you have not enough permissions"
        );

        balances[senderAddress] = balances[senderAddress] - value;
        balances[receiverAddress] = balances[receiverAddress] + value;
        allowed[senderAddress][msg.sender] = allowed[senderAddress][msg.sender] - value;

        emit Transfer(senderAddress, receiverAddress, value);

        return true;
    }

    function approve(address spenderAddress, uint256 value) public returns (bool success) {
        allowed[msg.sender][spenderAddress] = value;

        emit Approval(msg.sender, spenderAddress, value);

        return true;
    }

    function allowance(address allowerAddress, address spenderAddress) public view returns (uint256 remaining) {
        return allowed[allowerAddress][spenderAddress];
    }

    // additional
    function mint(address ownerAddress, uint256 amount) public onlyOwner {
        totalCount = totalCount + amount;
        balances[ownerAddress] = balances[ownerAddress] + amount;

        emit Transfer(address(0), ownerAddress, amount);
    }

    function burn(address ownerAddress, uint256 amount) public onlyOwner {
        require(amount <= balances[ownerAddress], "Tokens balance is less than burning tokens value");

        totalCount = totalCount - amount;
        balances[ownerAddress] = balances[ownerAddress] - amount;

        emit Transfer(ownerAddress, address(0), amount);
    }
}
