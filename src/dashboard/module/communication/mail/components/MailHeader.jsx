import React from 'react';
import { Input, Button, Tooltip } from 'antd';
import { FiSearch, FiRefreshCw, FiMoreVertical } from 'react-icons/fi';

const MailHeader = ({ searchText, setSearchText }) => {
  return (
    <div className="mail-header">
      <div className="header-actions">
        <Tooltip title="Refresh">
          <Button icon={<FiRefreshCw />} />
        </Tooltip>
        <Tooltip title="More actions">
          <Button icon={<FiMoreVertical />} />
        </Tooltip>
      </div>

      <div className="search-wrapper">
        <Input
          prefix={<FiSearch />}
          placeholder="Search in emails..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
    </div>
  );
};

export default MailHeader;