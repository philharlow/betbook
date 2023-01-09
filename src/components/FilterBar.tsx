import React from 'react';
import { FilterLevel, FilterLevels, useUIState } from '../store/uiStore';
import OptionBar from './OptionBar';

function FilterBar() {
  const filterLevel = useUIState(state => state.filterLevel);
  const setFilterLevel = useUIState(state => state.setFilterLevel);

  return (
    <OptionBar options={FilterLevels} selected={filterLevel} onSelectionChanged={(val) => setFilterLevel(val as FilterLevel)} showArchiveToggle={true} />
  );
}

export default FilterBar;
