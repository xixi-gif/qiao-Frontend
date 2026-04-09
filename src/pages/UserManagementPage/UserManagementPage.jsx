import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Space, Tag, Modal, Form, message, Popconfirm, Select, Layout, Card, Typography } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined, LockOutlined, UnlockOutlined, DownloadOutlined } from '@ant-design/icons';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';
import * as XLSX from 'xlsx';

const { Content } = Layout;
const { Search } = Input;
const { Option } = Select;
const { Title } = Typography;
const FormItem = Form.Item;

const UserManagementPage = () => {
  const [form] = Form.useForm();
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [filteredData, setFilteredData] = useState([]);

  const userRoleMap = {
    visitor: { text: '游客', color: 'default' },
    merchant: { text: '商家', color: 'blue' },
  };

  const exportExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      序号: index + 1,
      用户名: item.username,
      手机号: item.phone,
      角色: item.role === 'visitor' ? '游客' : '商家',
      店铺名称: item.shop_name || '',
      店铺地址: item.shop_address || '',
      状态: item.is_active ? '正常' : '禁用',
      创建时间: item.create_time || ''
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '用户列表');
    XLSX.writeFile(wb, `用户列表_${new Date().getTime()}.xlsx`);
    message.success('导出成功');
  };

  const fetchUserList = async () => {
    setLoading(true);
    try {
      const res = await api.userAdminApi.getUserList();
      const allUsers = res.data.data || [];
      const filteredUsers = allUsers.filter(item => item.role === 'visitor' || item.role === 'merchant');
      setUserList(filteredUsers);
      setFilteredData(filteredUsers);
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    const res = userList.filter(item =>
      item.username.includes(value) || item.phone.includes(value)
    );
    setFilteredData(res);
  };

  const handleTableChange = (pagination, filters, sorter) => {
    let data = [...userList];
    
    if (filters.role && filters.role.length > 0) {
      data = data.filter(item => filters.role.includes(item.role));
    }
    if (filters.is_active !== undefined && filters.is_active !== null) {
      data = data.filter(item => item.is_active === (filters.is_active[0] === 'true'));
    }
    
    if (sorter.field) {
      data.sort((a, b) => {
        if (sorter.field === 'create_time') {
          return sorter.order === 'ascend' 
            ? new Date(a.create_time) - new Date(b.create_time)
            : new Date(b.create_time) - new Date(a.create_time);
        }
        return 0;
      });
    }
    
    setFilteredData(data);
  };

  const handleEdit = (record) => {
    setCurrentUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.userAdminApi.deleteUser(id);
      const newList = userList.filter(item => item.id !== id);
      setUserList(newList);
      setFilteredData(newList);
      message.success('删除成功');
    } catch (e) {
      message.error('删除失败');
    }
  };

  const toggleStatus = async (record) => {
    try {
      await api.userAdminApi.toggleStatus(record.id);
      const newList = userList.map(item =>
        item.id === record.id ? { ...item, is_active: !item.is_active } : item
      );
      setUserList(newList);
      setFilteredData(newList);
      message.success('状态更新成功');
    } catch (e) {
      message.error('状态更新失败');
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async values => {
      const params = { ...currentUser, ...values };
      if (params.role === 'visitor') {
        params.shop_name = '';
        params.shop_address = '';
      }
      try {
        await api.userAdminApi.updateUser(params.id, params);
        const newList = userList.map(item => item.id === params.id ? params : item);
        setUserList(newList);
        setFilteredData(newList);
        message.success('保存成功');
        setModalVisible(false);
      } catch (e) {
        message.error('保存失败');
      }
    });
  };

  useEffect(() => {
    fetchUserList();
  }, []);

  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    { title: '用户名', dataIndex: 'username', key: 'username', width: 140 },
    { title: '手机号', dataIndex: 'phone', key: 'phone', width: 150 },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      filters: [
        { text: '游客', value: 'visitor' },
        { text: '商家', value: 'merchant' },
      ],
      filterCloseMenu: false,
      filterMultiple: false,
      render: (r) => <Tag color={userRoleMap[r]?.color}>{userRoleMap[r]?.text}</Tag>,
    },
    { title: '店铺名称', dataIndex: 'shop_name', key: 'shop_name', width: 160, render: t => t || '-' },
    { title: '店铺地址', dataIndex: 'shop_address', key: 'shop_address', ellipsis: true, width: 220 },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      filters: [
        { text: '正常', value: 'true' },
        { text: '禁用', value: 'false' },
      ],
      filterCloseMenu: false,
      filterMultiple: false,
      render: s => <Tag color={s ? 'green' : 'red'}>{s ? '正常' : '禁用'}</Tag>,
    },
    { title: '创建时间', dataIndex: 'create_time', key: 'create_time', width: 180, sorter: true },
    {
      title: '操作', key: 'action', width: 300, render: (_, r) => (
        <Space size="small">
          <Button type="text" icon={r.is_active ? <LockOutlined /> : <UnlockOutlined />} onClick={() => toggleStatus(r)}>
            {r.is_active ? '禁用' : '启用'}
          </Button>
          <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(r.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: '30px 24px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <Card 
            style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            title={<Title level={4} style={{ margin: 0, color: '#9C706A' }}>用户管理</Title>}
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Search placeholder="搜索用户名/手机号" allowClear style={{ width: 280 }} onSearch={handleSearch} />
              <Button icon={<DownloadOutlined />} type="primary" onClick={exportExcel} style={{ backgroundColor: '#9C706A', borderColor: '#9C706A' }}>导出Excel</Button>
            </div>
            <Table
              size="middle"
              rowKey="id"
              loading={loading}
              columns={columns}
              dataSource={filteredData}
              onChange={handleTableChange}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 'auto' }}
            />
          </Card>

          <Modal title="编辑用户" open={modalVisible} onOk={handleModalOk} onCancel={() => setModalVisible(false)} width={460}>
            <Form form={form} layout="vertical">
              <FormItem name="username" label="用户名"><Input /></FormItem>
              <FormItem name="phone" label="手机号"><Input /></FormItem>
              <FormItem name="role" label="角色">
                <Select>
                  <Option value="visitor">游客</Option>
                  <Option value="merchant">商家</Option>
                </Select>
              </FormItem>
              {form.getFieldValue('role') === 'merchant' && (
                <>
                  <FormItem name="shop_name" label="店铺名称"><Input /></FormItem>
                  <FormItem name="shop_address" label="店铺地址"><Input /></FormItem>
                </>
              )}
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default UserManagementPage;