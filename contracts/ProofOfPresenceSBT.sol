// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ProofOfPresenceSBT
 * @dev Soulbound Token (SBT) for event attendance certificates
 * Non-transferable NFTs that prove physical presence at events
 */
contract ProofOfPresenceSBT is ERC721, ERC721URIStorage, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _nextTokenId;

    // Mapping from token ID to revoked status
    mapping(uint256 => bool) private _revoked;

    // Events
    event CertificateIssued(address indexed to, uint256 indexed tokenId, string uri);
    event CertificateRevoked(uint256 indexed tokenId);
    event BatchCertificatesIssued(address[] indexed recipients, uint256[] tokenIds);

    constructor() ERC721("Proof of Presence Certificate", "POPC") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
    }

    /**
     * @dev Mints a new certificate to the specified address
     * @param to Address to receive the certificate
     * @param uri IPFS URI for the certificate metadata
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string calldata uri) 
        public 
        onlyRole(MINTER_ROLE) 
        returns (uint256) 
    {
        require(to != address(0), "Cannot mint to zero address");
        
        uint256 tokenId = _nextTokenId;
        _nextTokenId++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit CertificateIssued(to, tokenId, uri);
        
        return tokenId;
    }

    /**
     * @dev Batch mints certificates to multiple addresses
     * @param toList Array of addresses to receive certificates
     * @param uris Array of IPFS URIs for certificate metadata
     */
    function batchMint(address[] calldata toList, string[] calldata uris) 
        public 
        onlyRole(MINTER_ROLE) 
        returns (uint256[] memory)
    {
        require(toList.length == uris.length, "Arrays length mismatch");
        require(toList.length > 0, "Empty arrays");

        uint256[] memory tokenIds = new uint256[](toList.length);

        for (uint256 i = 0; i < toList.length; i++) {
            tokenIds[i] = mint(toList[i], uris[i]);
        }

        emit BatchCertificatesIssued(toList, tokenIds);

        return tokenIds;
    }

    /**
     * @dev Updates the token URI for a certificate (admin only)
     * @param tokenId Token ID to update
     * @param uri New IPFS URI
     */
    function setTokenURI(uint256 tokenId, string calldata uri) 
        public 
        onlyRole(ADMIN_ROLE) 
    {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Revokes a certificate (marks as invalid but doesn't burn)
     * @param tokenId Token ID to revoke
     */
    function revoke(uint256 tokenId) public onlyRole(ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        require(!_revoked[tokenId], "Token already revoked");
        
        _revoked[tokenId] = true;
        emit CertificateRevoked(tokenId);
    }

    /**
     * @dev Checks if a certificate is revoked
     * @param tokenId Token ID to check
     * @return bool True if revoked, false otherwise
     */
    function isRevoked(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return _revoked[tokenId];
    }

    /**
     * @dev Returns whether a token is locked (always true for SBT)
     * EIP-5192 compliance
     * @param tokenId Token ID to check
     * @return bool Always returns true (all tokens are locked)
     */
    function locked(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Token does not exist");
        return true; // All tokens are soulbound (non-transferable)
    }

    /**
     * @dev Override _update to prevent transfers (Soulbound implementation)
     * Allows minting and burning, but blocks all transfers
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Allow minting (from == address(0))
        // Allow burning (to == address(0))
        // Block all other transfers
        if (from != address(0) && to != address(0)) {
            revert("SBT: Token is non-transferable");
        }
        
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Returns the total number of tokens minted
     */
    function totalSupply() public view returns (uint256) {
        return _nextTokenId;
    }

    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Internal function to check token existence
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _ownerOf(tokenId) != address(0);
    }
}
