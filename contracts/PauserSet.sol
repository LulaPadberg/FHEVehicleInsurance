// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PauserSet
 * @notice Immutable contract that manages multiple authorized pausers
 * @dev Used to control pause/unpause functionality in the main contract
 */
contract PauserSet {
    address[] public pausers;
    mapping(address => bool) public isPauser;

    event PauserAdded(address indexed pauser);

    /**
     * @notice Constructor to set immutable pausers
     * @param _pausers Array of addresses authorized to pause
     */
    constructor(address[] memory _pausers) {
        require(_pausers.length > 0, "At least one pauser required");

        for (uint256 i = 0; i < _pausers.length; i++) {
            require(_pausers[i] != address(0), "Invalid pauser address");
            require(!isPauser[_pausers[i]], "Duplicate pauser address");

            pausers.push(_pausers[i]);
            isPauser[_pausers[i]] = true;

            emit PauserAdded(_pausers[i]);
        }
    }

    /**
     * @notice Check if an address is an authorized pauser
     * @param _address Address to check
     * @return bool True if address is a pauser
     */
    function isAuthorizedPauser(address _address) external view returns (bool) {
        return isPauser[_address];
    }

    /**
     * @notice Get all pauser addresses
     * @return address[] Array of all pausers
     */
    function getPausers() external view returns (address[] memory) {
        return pausers;
    }

    /**
     * @notice Get the number of pausers
     * @return uint256 Count of pausers
     */
    function getPauserCount() external view returns (uint256) {
        return pausers.length;
    }
}
