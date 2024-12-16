import React from 'react';
import styled from 'styled-components/macro';
import { useUIState } from '../store/uiStore';


const SearchBarDiv = styled.div`
  display: flex;
  position: relative;
  align-items: center;
`;

const ClearButton = styled.div`
  background-color: #333;
  color: #999;
  font-size: 10px;
  position: absolute;
  right: 10px;
  padding: 3px 5px;
  border-radius: 100px;
  cursor: pointer;
  &:after {
    content: "X";
  }
`;

const SearchInput = styled.input`
  font-size: 20px;
  border-radius: 10px;
  padding: 4px;
  background: #111;
  border: 1px solid #222;
  color: #fff;
  flex: 1;

  &:focus {
    outline: none;
  }
`;

function SearchBar() {
  const searchQuery = useUIState(state => state.searchQuery);
  const setSearchQuery = useUIState(state => state.setSearchQuery);

  let clearInput = () => {
    setSearchQuery("");
    // Not ideal
    (document.querySelector("#search") as HTMLInputElement).focus();
  };

  return (
    <SearchBarDiv>
      <SearchInput
        id="search"
        type="text"
        placeholder="Search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {searchQuery && <ClearButton onClick={clearInput} />}
    </SearchBarDiv>
  );
}

export default SearchBar;
