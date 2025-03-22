import React from "react";
import {
  Avatar,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Badge,
  Dropdown,
} from "antd";
import {
  EditOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { selectCurrentUser, logout } from "../auth/services/authSlice";
import { useNavigate } from "react-router-dom";
import "./dashboard.scss";
import { useLogout } from "../hooks/useLogout";

const { Title, Text } = Typography;

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = useLogout();

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "View Profile",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
    },
    {
      key: "switch",
      icon: <UserSwitchOutlined />,
      label: "Switch Account",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      onClick: handleLogout,
    },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getUserFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.username || "User";
  };

  const getRoleName = () => {
    return (
      user?.roleName
        ?.split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") || "User Role"
    );
  };

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <h1>Dashboard</h1>
      <Row className="dashboard-header" justify="end" align="middle">
        <Dropdown
          menu={{ items: userMenuItems }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Avatar
            size={40}
            src={user?.profilePic}
            style={{
              cursor: "pointer",
              backgroundColor: user?.profilePic ? "transparent" : "#1890ff",
            }}
          >
            {!user?.profilePic && getInitials(getUserFullName())}
          </Avatar>
        </Dropdown>
      </Row>

      {/* Centered Profile Card */}
      <Row
        justify="center"
        align="middle"
        style={{ minHeight: "calc(100vh - 100px)" }}
      >
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card className="profile-card" variant="default">
            <div className="profile-content">
              <Badge dot status="success" offset={[-5, 85]}>
                <Avatar
                  size={120}
                  src={user?.profilePic}
                  style={{
                    backgroundColor: user?.profilePic
                      ? "transparent"
                      : "#1890ff",
                  }}
                >
                  {!user?.profilePic && getInitials(getUserFullName())}
                </Avatar>
              </Badge>

              <div className="profile-info">
                <Title level={2}>{getUserFullName()}</Title>
                <Text type="secondary" className="role-text">
                  {getRoleName()}
                </Text>

                <div className="user-details">
                  <div className="detail-item">
                    <Text type="secondary">Email</Text>
                    <Text strong>{user?.email}</Text>
                  </div>
                  <div className="detail-item">
                    <Text type="secondary">Username</Text>
                    <Text strong>{user?.username}</Text>
                  </div>
                  <div className="detail-item">
                    <Text type="secondary">Member Since</Text>
                    <Text strong>
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </Text>
                  </div>
                </div>

                <Space
                  direction="horizontal"
                  size="middle"
                  className="action-buttons"
                >
                  <Button type="primary" icon={<EditOutlined />}>
                    Edit Profile
                  </Button>
                  <Button icon={<SettingOutlined />}>Settings</Button>
                </Space>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
