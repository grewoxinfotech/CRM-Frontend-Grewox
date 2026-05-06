import React from "react";
import { Breadcrumb, Typography, Space, Button, Input, Popover, Dropdown, Switch } from "antd";
import { FiHome, FiList, FiGrid, FiSearch, FiDownload, FiPlus, FiZap } from "react-icons/fi";
import { Link } from "react-router-dom";
import "./PageHeader.scss";

const { Title, Text } = Typography;

const PageHeader = ({
  title,
  count,
  subtitle,
  breadcrumbItems = [],
  searchText,
  onSearch,
  searchPlaceholder = "Search...",
  viewMode,
  onViewChange,
  showViewToggle,
  exportMenu,
  onAdd,
  addText = "Add New",
  isQuickMode,
  onQuickModeToggle,
  showQuickMode = false,
  extraActions,
  mobileSearchContent,
  isSearchVisible,
  onSearchVisibleChange
}) => {
  const shouldShowViewToggle = showViewToggle !== undefined ? showViewToggle : Boolean(onViewChange);

  return (
    <div className="custom-page-header-container">
      <div className="page-breadcrumb">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="page-header">
        <div className="header-content">
          <div className="page-title">
            <div className="title-row">
              <div className="page-title-content">
                <Title level={2} style={{ textTransform: 'capitalize' }}>
                  {title} {count !== undefined && `(${count})`}
                </Title>
                {subtitle && <Text type="secondary">{subtitle}</Text>}
              </div>

              <div className="header-actions">
                <div className="desktop-actions">
                  <Space size={16} align="center">
                    {shouldShowViewToggle && (
                      <Space className="view-toggle" size={8}>
                        <Button
                          type={viewMode === "table" ? "primary" : "default"}
                          icon={<FiList size={16} />}
                          onClick={() => onViewChange?.("table")}
                          style={{ borderRadius: '8px', height: '30px' }}
                        />
                        <Button
                          type={viewMode === "card" ? "primary" : "default"}
                          icon={<FiGrid size={16} />}
                          onClick={() => onViewChange?.("card")}
                          style={{ borderRadius: '8px', height: '30px' }}
                        />
                      </Space>
                    )}

                    {onSearch && (
                      <div className="search-container">
                        <Input
                          prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                          placeholder={searchPlaceholder}
                          allowClear
                          onChange={(e) => onSearch?.(e.target.value)}
                          value={searchText}
                          className="search-input"
                          style={{ borderRadius: '8px', height: '30px' }}
                        />
                      </div>
                    )}

                    <Space size={12} className="action-buttons-group">
                      {mobileSearchContent && (
                        <Popover
                          content={mobileSearchContent}
                          trigger="click"
                          open={isSearchVisible}
                          onOpenChange={onSearchVisibleChange}
                          placement="bottomRight"
                          className="mobile-search-popover"
                        >
                          <Button
                            className="search-icon-button"
                            icon={<FiSearch size={16} />}
                            style={{ borderRadius: '8px', height: '30px' }}
                          />
                        </Popover>
                      )}

                      {extraActions}

                      {exportMenu && (
                        <Dropdown menu={exportMenu} trigger={["click"]}>
                          <Button className="export-button" style={{ borderRadius: '8px', height: '30px' }}>
                            <FiDownload size={16} />
                            <span className="button-text">Export</span>
                          </Button>
                        </Dropdown>
                      )}

                      {showQuickMode && (
                        <div className="quick-mode-toggle" style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          background: "#fff",
                          padding: "0 12px",
                          borderRadius: "8px",
                          height: "30px",
                          border: "1px solid #d9d9d9",
                        }}>
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "24px",
                            height: "24px",
                            flexShrink: 0,
                            borderRadius: "50%",
                            background: isQuickMode ? "#fff1b8" : "#f5f5f5",
                            transition: "all 0.3s"
                          }}>
                            <FiZap size={14} style={{ color: isQuickMode ? "#faad14" : "#8c8c8c" }} />
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: "500", color: "#595959" }}>Quick Mode</span>
                          <Switch
                            size="small"
                            checked={isQuickMode}
                            onChange={onQuickModeToggle}
                            style={{
                              backgroundColor: isQuickMode ? "#faad14" : "rgba(0, 0, 0, 0.25)"
                            }}
                          />
                        </div>
                      )}

                      {onAdd && (
                        <Button
                          type="primary"
                          icon={<FiPlus size={16} />}
                          onClick={onAdd}
                          className="add-button"
                          style={{ borderRadius: '8px', height: '30px' }}
                        >
                          <span className="button-text">{addText}</span>
                        </Button>
                      )}
                    </Space>
                  </Space>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
