pragma solidity >=0.4.24;

// @Dev importing openzeppelin-solidity ERC-721 implemented Standard
import "../node_modules/openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";

// @dev StarNotary Contract declaration inheritance the ERC721 openzeppelin implementation
contract StarNotary is ERC721 {

    // Star data
    struct Star {
        string name;
    }

    // @Dev adding name and symbol properties
    string public name = "Twinkle Twinkle";
    string public symbol = "LTSTR";
    
    // @Dev mapping the Star with the Owner Address
    mapping(uint256 => Star) public tokenIdToStarInfo;
    // @Dev mapping the TokenId and price
    mapping(uint256 => uint256) public starsForSale;

    
    // @Dev - Creating Star using the Struct; Passing the name and tokenId as a parameters
    function createStar(string memory _name, uint256 _tokenId) public { 
        // Star is an struct so we are creating a new Star
        Star memory newStar = Star(_name); 
        // Creating in memory the Star -> tokenId mapping
        tokenIdToStarInfo[_tokenId] = newStar; 
        // _mint assign the the star with _tokenId to the sender address (ownership)
        _mint(msg.sender, _tokenId); 
    }

    // @Dev - Putting an Star for sale (Adding the star tokenid into the mapping starsForSale, first verify that the sender is the owner)
    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "You can't sale the Star you don't owned");
        starsForSale[_tokenId] = _price;
    }


    // @Dev - Function allowing a conversion of an address into a payable address
    function _make_payable(address x) internal pure returns (address payable) {
        return address(uint160(x));
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0, "The Star should be up for sale");
        uint256 starCost = starsForSale[_tokenId];
        address ownerAddress = ownerOf(_tokenId);
        require(msg.value > starCost, "You need to have enough Ether");
        // We can't use _addTokenTo or_removeTokenFrom functions, now we have to use _transferFrom
        _transferFrom(ownerAddress, msg.sender, _tokenId); 
        // We need to make this conversion to be able to use transfer() function to transfer ethers
        address payable ownerAddressPayable = _make_payable(ownerAddress); 
        ownerAddressPayable.transfer(starCost);
        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
    }

    // Implement Task 1 lookUptokenIdToStarInfo - Udacity instructions
    function lookUptokenIdToStarInfo (uint _tokenId) public view returns (string memory) {
        //1. @Dev returning the Star saved in tokenIdToStarInfo mapping
        return tokenIdToStarInfo[_tokenId].name;
    }

    // Implement Task 1 Exchange Stars function - Udacity instructions
    function exchangeStars(uint256 _tokenId1, uint256 _tokenId2) public {
        //1. @Dev passing to star tokenId you will need to check if the owner of _tokenId1 or _tokenId2 is the sender
        //2. @Dev getting the owner of the two tokens (ownerOf(_tokenId1), ownerOf(_tokenId2)

        address firstOwner = ownerOf(_tokenId1);
        address secondOwner = ownerOf(_tokenId2);
        
        require(firstOwner == msg.sender || secondOwner == msg.sender, "Invalid Ownership");
        
        //3. Use _transferFrom function to exchange the tokens.
        _transferFrom(firstOwner, secondOwner, _tokenId1);
        _transferFrom(secondOwner, firstOwner, _tokenId2);
    }

    // Implement Task 1 Transfer Stars
    function transferStar(address _to1, uint256 _tokenId) public {
        //1. Check if the sender is the ownerOf(_tokenId)
        require(msg.sender == ownerOf(_tokenId), "Invalid Ownership");
        //2. Use the transferFrom(from, to, tokenId); function to transfer the Star
        _transferFrom(msg.sender, _to1, _tokenId);
    }
}
