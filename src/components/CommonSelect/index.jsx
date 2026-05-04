import React from 'react';
import { Select, Divider, Button, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { FiChevronDown, FiTrash2 } from 'react-icons/fi';

const { Option } = Select;

const CommonSelect = ({
  placeholder,
  options = [],
  value,
  onChange,
  onAddClick,
  addButtonText,
  icon: PrefixIcon,
  loading = false,
  showSearch = true,
  allowClear = true,
  disabled = false,
  onDelete,
  deleteTitle = "Delete Item",
  deleteDescription = "Are you sure you want to delete this item?",
  style = {},
  className = "",
  selectRef,
  open,
  onDropdownVisibleChange,
  dropdownOpen,
  ...props
}) => {
  const prefixIconStyles = `
    .select-with-prefix-icon.ant-select:not(.ant-select-customize-input) .ant-select-selector {
      padding-left: 40px !important;
    }
    .select-with-prefix-icon.ant-select-single .ant-select-selection-item,
    .select-with-prefix-icon.ant-select-single .ant-select-selection-placeholder {
      padding-left: 0 !important;
    }
  `;

  const selectStyle = {
    width: '100%',
    height: '48px',
    borderRadius: '10px',
    backgroundColor: '#f8fafc',
    ...style
  };

  const prefixIconStyle = {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#1890ff',
    fontSize: 16,
    pointerEvents: 'none',
    zIndex: 1,
  };

  return (
    <div style={{ position: 'relative' }}>
      <style>{prefixIconStyles}</style>
      {PrefixIcon && <PrefixIcon style={prefixIconStyle} />}
      <Select
        ref={selectRef}
        open={open || dropdownOpen}
        onDropdownVisibleChange={onDropdownVisibleChange}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        loading={loading}
        showSearch={showSearch}
        allowClear={allowClear}
        style={selectStyle}
        className={`${PrefixIcon ? 'select-with-prefix-icon' : ''} ${className}`}
        suffixIcon={<FiChevronDown size={14} style={{ color: '#8c8c8c' }} />}
        optionFilterProp="label"
        optionLabelProp="label"
        listHeight={300}
        dropdownRender={(menu) => (
          <div onClick={(e) => e.stopPropagation()}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {menu}
            </div>
            {onAddClick && (
              <>
                <Divider style={{ margin: '8px 0' }} />
                <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={onAddClick}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      border: 'none',
                      height: '40px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                      fontWeight: '500',
                    }}
                  >
                    {addButtonText || 'Add New'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
        options={options?.map(item => ({
          label: item.name || item.label,
          value: item.id || item.value,
          item: item // Store the original item for custom rendering
        }))}
        optionRender={(option) => {
          const item = option.data.item;
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {item.icon && <item.icon style={{ color: item.iconColor || '#1890ff', fontSize: '16px' }} />}
                {item.image && (
                   <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#e6f7ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}>
                    <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                {item.color && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: item.color
                  }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '500', color: '#111827' }}>{item.name || item.label}</span>
                  {(item.subLabel || item.subText) && (
                    <span style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.subIcon && <item.subIcon style={{ fontSize: '12px' }} />}
                      {item.subLabel || item.subText}
                    </span>
                  )}
                </div>
              </div>
              {onDelete && value !== (item.id || item.value) && (
                <Popconfirm
                  title={deleteTitle}
                  description={deleteDescription}
                  onConfirm={(e) => {
                    e?.stopPropagation?.();
                    onDelete(item.id || item.value);
                  }}
                  okText="Yes"
                  cancelText="No"
                  placement="left"
                >
                  <Button
                    type="text"
                    icon={<FiTrash2 style={{ color: "#ff4d4f" }} />}
                    size="small"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.8,
                    }}
                  />
                </Popconfirm>
              )}
            </div>
          );
        }}
        {...props}
      />
    </div>
  );
};

export default CommonSelect;
