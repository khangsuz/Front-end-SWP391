import React, { useEffect, useState } from "react";
import { Table, Spin, Button, Modal, Input, Select, Card, Space, Typography, Tag, message, Tooltip, Row, Col, Statistic } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, ExclamationCircleOutlined, UserSwitchOutlined, MailOutlined, PhoneOutlined, HomeOutlined, LockOutlined, ShopOutlined } from '@ant-design/icons';
import api from "../../config/axios";

const { Title, Text } = Typography;
const { Column } = Table;
const { confirm } = Modal;
const { Option } = Select;
const { Search } = Input;

const QuanLiNguoiDung = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    userType: '',
    password: '',
  });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await api.get('admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      setError("Lỗi khi tải dữ liệu người dùng.");
      message.error('Không thể tải dữ liệu người dùng');
    } finally {
      setLoading(false);
    }
  };

  // Function to delete a user
  const deleteUser = (userId) => {
    const token = localStorage.getItem("token");
    confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          const response = await api.delete(`admin/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.status === 200) {
            setUsers(users.filter(user => user.userId !== userId));
            message.success('Xóa người dùng thành công');
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          
          if (error.response) {
            switch (error.response.status) {
              case 400:
                message.error('Không thể xóa người dùng này vì họ có đơn hàng hoặc sản phẩm liên quan');
                break;
              case 403:
                message.error('Bạn không có quyền xóa người dùng này');
                break;
              case 404:
                message.error('Không tìm thấy người dùng');
                break;
              case 401:
                message.error('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
                break;
              default:
                message.error('Không thể xóa người dùng. Vui lòng thử lại sau');
            }
          } else if (error.request) {
            message.error('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng');
          } else {
            message.error('Có lỗi xảy ra khi xóa người dùng');
          }
        }
      },
    });
  };

  const openEditModal = (user) => {
    setCurrentUser(user);
    setUpdatedUser({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      userType: user.userType,
      password: '',
    });
    setIsModalVisible(true);
  };

  const updateUser = async () => {
    const token = localStorage.getItem("token");

    const userToUpdate = {
      name: updatedUser.name,
      email: updatedUser.email,
      userType: updatedUser.userType,
      phone: updatedUser.phone,
      address: updatedUser.address,
      password: updatedUser.password || undefined
    };

    try {
      await api.put(`admin/users/${currentUser.userId}`, userToUpdate, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Cập nhật danh sách người dùng sau khi thay đổi
      setUsers(users.map(user => user.userId === currentUser.userId ? { ...user, ...userToUpdate } : user));
      setIsModalVisible(false);
      message.success('Cập nhật thông tin người dùng thành công');
    } catch (error) {
      if (error.response) {
        console.log("Error data:", error.response.data);
      }
      setError("Lỗi khi cập nhật thông tin người dùng.");
      message.error('Không thể cập nhật thông tin người dùng');
    }
  };

  const getUserTypeTag = (userType) => {
    const config = {
      'Admin': { color: 'purple', icon: <UserSwitchOutlined /> },
      'Seller': { color: 'blue', icon: <ShopOutlined /> },
      'Buyer': { color: 'green', icon: <UserOutlined /> }
    };
    return (
      <Tag color={config[userType]?.color} icon={config[userType]?.icon}>
        {userType}
      </Tag>
    );
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchText.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.address?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Spin size="large" />
    </div>
  );
  
  if (error) return (
    <Result
      status="error"
      title="Lỗi tải dữ liệu"
      subTitle={error}
      extra={
        <Button type="primary" onClick={fetchUsers}>
          Thử lại
        </Button>
      }
    />
  );

  return (
    <div className="p-6">
      <Card className="bg-white mb-4 rounded-lg shadow-sm">
        <Title level={2}>
          <Space>
            <UserOutlined />
            Quản Lý Người Dùng
          </Space>
        </Title>
      </Card>

      <Row gutter={16} className="mt-4">
        <Col span={8}>
          <Card hoverable className="rounded-lg shadow-sm">
            <Statistic
              title="Tổng số người dùng"
              value={users.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable className="rounded-lg shadow-sm">
            <Statistic
              title="Người bán"
              value={users.filter(u => u.userType === 'Seller').length}
              prefix={<ShopOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card hoverable className="rounded-lg shadow-sm">
            <Statistic
              title="Người mua"
              value={users.filter(u => u.userType === 'Buyer').length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 rounded-lg shadow-sm">
        <Space className="mb-4">
          <Search
            placeholder="Tìm kiếm theo tên, email, SĐT hoặc địa chỉ..."
            style={{ width: 300 }}
            allowClear
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
          />
          <Button 
            icon={<ReloadOutlined />}
            onClick={fetchUsers}
          >
            Làm mới
          </Button>
        </Space>

        <Table 
          dataSource={filteredUsers} 
          rowKey="userId"
          className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:font-semibold"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`
          }}
        >
          <Column title="ID" dataIndex="userId" key="userId" width={80} />
          <Column 
            title="Tên người dùng" 
            dataIndex="name" 
            key="name"
            width={180}
            render={(text) => (
              <Space>
                <UserOutlined />
                <Text strong>{text}</Text>
              </Space>
            )}
          />
          <Column 
            title="Email" 
            dataIndex="email" 
            key="email"
            width={250}
            render={(text) => (
              <Space>
                <MailOutlined />
                {text}
              </Space>
            )}
          />
          <Column 
            title="Vai trò" 
            dataIndex="userType" 
            key="userType"
            width={100}
            render={(text) => getUserTypeTag(text)}
            filters={[
              { text: 'Admin', value: 'Admin' },
              { text: 'Seller', value: 'Seller' },
              { text: 'Buyer', value: 'Buyer' },
            ]}
            onFilter={(value, record) => record.userType === value}
          />
          <Column 
            title="Số điện thoại" 
            dataIndex="phone" 
            key="phone"
            width={120}
            render={(text) => (
              <Space>
                <PhoneOutlined />
                {text}
              </Space>
            )}
          />
          <Column 
            title="Địa chỉ" 
            dataIndex="address" 
            key="address"
            ellipsis={true}
            render={(text) => (
              <Tooltip title={text}>
                <Space>
                  <HomeOutlined />
                  {text}
                </Space>
              </Tooltip>
            )}
          />
          <Column 
            title="Ngày đăng ký" 
            dataIndex="registrationDate" 
            key="registrationDate"
            width={120}
            render={(date) => (
              <Tooltip title={new Date(date).toLocaleString('vi-VN')}>
                {new Date(date).toLocaleDateString('vi-VN')}
              </Tooltip>
            )}
            sorter={(a, b) => new Date(a.registrationDate) - new Date(b.registrationDate)}
          />
          <Column
            title="Hành động"
            key="actions"
            fixed="right"
            width={120}
            render={(text, record) => (
              <Space>
                <Tooltip title="Chỉnh sửa">
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => openEditModal(record)}
                  />
                </Tooltip>
                <Tooltip title="Xóa">
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => deleteUser(record.userId)}
                  />
                </Tooltip>
              </Space>
            )}
          />
        </Table>
      </Card>

      <Modal
        title={
          <Space>
            <EditOutlined />
            Chỉnh sửa thông tin người dùng
          </Space>
        }
        open={isModalVisible}
        onOk={updateUser}
        onCancel={() => setIsModalVisible(false)}
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Input
            prefix={<UserOutlined />}
            placeholder="Tên người dùng"
            value={updatedUser.name}
            onChange={(e) => setUpdatedUser({ ...updatedUser, name: e.target.value })}
          />
          <Input
            prefix={<MailOutlined />}
            placeholder="Email"
            value={updatedUser.email}
            onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
          />
          <Input
            prefix={<PhoneOutlined />}
            placeholder="Số điện thoại"
            value={updatedUser.phone}
            onChange={(e) => setUpdatedUser({ ...updatedUser, phone: e.target.value })}
          />
          <Input
            prefix={<HomeOutlined />}
            placeholder="Địa chỉ"
            value={updatedUser.address || "Chưa đăng ký địa chỉ"} 
            onChange={(e) => setUpdatedUser({ ...updatedUser, address: e.target.value })}
            style={{ color: !updatedUser.address ? '#999' : 'inherit' }}
          />
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu (để trống nếu không thay đổi)"
            value={updatedUser.password}
            onChange={(e) => setUpdatedUser({ ...updatedUser, password: e.target.value })}
          />
          <Select
            value={updatedUser.userType}
            onChange={(value) => setUpdatedUser({ ...updatedUser, userType: value })}
            style={{ width: '100%' }}
          >
            {/* <Option value="Admin">Admin</Option> */}
            <Option value="Seller">Seller</Option>
            <Option value="Buyer">Buyer</Option>
          </Select>
        </Space>
      </Modal>
    </div>
  );
};

export default QuanLiNguoiDung;