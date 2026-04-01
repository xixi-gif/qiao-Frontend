import React, { useState, useEffect } from 'react';
import { Layout, Table, Card, Button, Space, Tag, message, Typography, Breadcrumb, Input, Select, Row, Col, Modal, Descriptions, Image, Popconfirm, Tabs, Form, InputNumber } from 'antd';
import { SearchOutlined, CheckOutlined, CloseOutlined, HomeOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../../public/Nav/nav';
import api from '../../service/api';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const AdminProjectManage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectList, setProjectList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentDetail, setCurrentDetail] = useState(null);

  const [tagLoading, setTagLoading] = useState(false);
  const [tagList, setTagList] = useState([]);
  const [tagModalVisible, setTagModalVisible] = useState(false);
  const [tagForm] = Form.useForm();
  const [currentTag, setCurrentTag] = useState(null);

  const [cateLoading, setCateLoading] = useState(false);
  const [cateList, setCateList] = useState([]);
  const [cateModalVisible, setCateModalVisible] = useState(false);
  const [cateForm] = Form.useForm();
  const [currentCate, setCurrentCate] = useState(null);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await api.projectApi.adminGetProjects({ title: searchTitle, status: filterStatus });
      setProjectList(res.data || []);
    } catch (err) {
      message.error('获取项目失败');
      setProjectList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      const res = await api.projectApi.adminGetProjectDetail(id);
      setCurrentDetail(res.data);
      setDetailVisible(true);
    } catch (err) {
      message.error('获取详情失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.projectApi.adminDeleteProject(id);
      message.success('删除成功');
      fetchProjects();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const handleAudit = async (id, status) => {
    try {
      await api.projectApi.adminAudit(id, status);
      message.success('操作成功');
      fetchProjects();
    } catch {
      message.error('操作失败');
    }
  };

  const handleBatchAudit = async (status) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择项目');
      return;
    }
    try {
      await api.projectApi.adminBatchAudit(selectedRowKeys, status);
      message.success('批量操作成功');
      setSelectedRowKeys([]);
      fetchProjects();
    } catch (err) {
      message.error('批量操作失败');
    }
  };

  const fetchTags = async () => {
    setTagLoading(true);
    try {
      const res = await api.tagApi.getList({ limit: 100 });
      setTagList(res.data || []);
    } catch (err) {
      message.error('获取标签失败');
    } finally {
      setTagLoading(false);
    }
  };

  const openTagModal = (record = null) => {
    setCurrentTag(record);
    if (record) {
      tagForm.setFieldsValue({ name: record.name, sort_num: record.sort_num });
    } else {
      tagForm.resetFields();
    }
    setTagModalVisible(true);
  };

  const handleSaveTag = async () => {
    const values = tagForm.getFieldsValue();
    try {
      if (currentTag) {
        await api.tagApi.update(currentTag.id, values);
        message.success('修改成功');
      } else {
        await api.tagApi.create(values);
        message.success('新增成功');
      }
      setTagModalVisible(false);
      fetchTags();
    } catch (err) {
      message.error('保存失败');
    }
  };

  const handleDeleteTag = async (id) => {
    try {
      await api.tagApi.delete(id);
      message.success('删除成功');
      fetchTags();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const fetchCategories = async () => {
    setCateLoading(true);
    try {
      const res = await api.categoryApi.getList({ limit: 100 });
      setCateList(res.data || []);
    } catch (err) {
      message.error('获取分类失败');
    } finally {
      setCateLoading(false);
    }
  };

  const openCateModal = (record = null) => {
    setCurrentCate(record);
    if (record) {
      cateForm.setFieldsValue({ name: record.name, sort_num: record.sort_num });
    } else {
      cateForm.resetFields();
    }
    setCateModalVisible(true);
  };

  const handleSaveCate = async () => {
    const values = cateForm.getFieldsValue();
    try {
      if (currentCate) {
        await api.categoryApi.update(currentCate.id, values);
        message.success('修改成功');
      } else {
        await api.categoryApi.create(values);
        message.success('新增成功');
      }
      setCateModalVisible(false);
      fetchCategories();
    } catch (err) {
      message.error('保存失败');
    }
  };

  const handleDeleteCate = async (id) => {
    try {
      await api.categoryApi.delete(id);
      message.success('删除成功');
      fetchCategories();
    } catch (err) {
      message.error('删除失败');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [searchTitle, filterStatus]);

  useEffect(() => {
    fetchTags();
    fetchCategories();
  }, []);

  const categoryMap = {
    culture: '文化体验',
    tourism: '旅游观光',
    study: '研学旅行',
    handmade: '非遗手作',
    festival: '民俗节庆',
  };

  const fixImageUrl = (url) => {
    if (!url) return "";
    let u = url.replace(/\\/g, "/");
    if (!u.startsWith("http")) {
      u = `http://127.0.0.1:8090${u}`;
    }
    return u;
  };

  const columns = [
    {
      title: '封面',
      dataIndex: 'cover',
      render: (url) => (
        <img 
          src={fixImageUrl(url)} 
          style={{ width: 60, height: 40, objectFit: 'cover' }} 
          alt="cover"
        />
      ),
    },
    {
      title: '项目名称',
      dataIndex: 'title',
    },
    {
      title: '分类',
      dataIndex: 'category',
      render: (c) => categoryMap[c] || c,
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (s) => {
        const color = s === 'active' ? 'green' : s === 'pending' ? 'gold' : 'red';
        const text = s === 'active' ? '已上架' : s === 'pending' ? '待审核' : '已驳回';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => fetchDetail(r.id)}>查看详情</Button>
          {r.status === 'pending' && <Button type="text" onClick={() => handleAudit(r.id, 'active')} icon={<CheckOutlined />}>通过</Button>}
          {r.status === 'pending' && <Button type="text" danger onClick={() => handleAudit(r.id, 'rejected')} icon={<CloseOutlined />}>驳回</Button>}
          {r.status === 'active' && <Button type="text" danger onClick={() => handleAudit(r.id, 'rejected')}>下架</Button>}
          <Popconfirm
            title="确定要删除该项目吗？"
            onConfirm={() => handleDelete(r.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  const tagTableColumns = [
    { title: '标签名称', dataIndex: 'name' },
    { title: '排序', dataIndex: 'sort_num' },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openTagModal(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteTag(r.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const cateTableColumns = [
    { title: '分类名称', dataIndex: 'name' },
    { title: '排序', dataIndex: 'sort_num' },
    {
      title: '操作',
      render: (_, r) => (
        <Space>
          <Button type="text" icon={<EditOutlined />} onClick={() => openCateModal(r)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDeleteCate(r.id)}>
            <Button type="text" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <Content style={{ padding: 24 }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <Breadcrumb>
            <Breadcrumb.Item onClick={() => navigate('/home')}><HomeOutlined />首页</Breadcrumb.Item>
            <Breadcrumb.Item>管理员中心</Breadcrumb.Item>
            <Breadcrumb.Item>项目综合管理</Breadcrumb.Item>
          </Breadcrumb>

          <Card>
            <Tabs defaultActiveKey="1" type="card" size="large">
              <TabPane tab="项目管理" key="1">
                <div style={{ padding: '8px 0' }}>
                  <Row gutter={16} style={{ marginBottom: 16 }}>
                    <Col xs={24} sm={8}>
                      <Input placeholder="搜索项目" value={searchTitle} onChange={(e) => setSearchTitle(e.target.value)} allowClear />
                    </Col>
                    <Col xs={24} sm={6}>
                      <Select placeholder="状态筛选" value={filterStatus} onChange={setFilterStatus} allowClear>
                        <Option value="pending">待审核</Option>
                        <Option value="active">已上架</Option>
                        <Option value="rejected">已驳回</Option>
                      </Select>
                    </Col>
                    <Col xs={24} sm={10}>
                      <Space>
                        <Button onClick={() => handleBatchAudit('active')}>批量通过</Button>
                        <Button danger onClick={() => handleBatchAudit('rejected')}>批量驳回</Button>
                      </Space>
                    </Col>
                  </Row>

                  <Table
                    rowSelection={rowSelection}
                    loading={loading}
                    rowKey="id"
                    columns={columns}
                    dataSource={projectList}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              </TabPane>

              <TabPane tab="标签管理" key="2">
                <div style={{ padding: '8px 0' }}>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openTagModal()}>新增标签</Button>
                  </div>
                  <Table
                    rowKey="id"
                    loading={tagLoading}
                    columns={tagTableColumns}
                    dataSource={tagList}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              </TabPane>

              <TabPane tab="分类管理" key="3">
                <div style={{ padding: '8px 0' }}>
                  <div style={{ marginBottom: 16, textAlign: 'right' }}>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => openCateModal()}>新增分类</Button>
                  </div>
                  <Table
                    rowKey="id"
                    loading={cateLoading}
                    columns={cateTableColumns}
                    dataSource={cateList}
                    pagination={{ pageSize: 10 }}
                  />
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </div>
      </Content>

      <Modal title="项目详情" open={detailVisible} onCancel={() => setDetailVisible(false)} footer={null} width={700}>
        {currentDetail && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Image width={250} src={fixImageUrl(currentDetail.cover)} fallback="https://via.placeholder.com/250" />
            </div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="项目名称">{currentDetail.title}</Descriptions.Item>
              <Descriptions.Item label="分类">{categoryMap[currentDetail.category] || currentDetail.category}</Descriptions.Item>
              <Descriptions.Item label="标签">{currentDetail.tags}</Descriptions.Item>
              <Descriptions.Item label="地址">{currentDetail.address}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{currentDetail.start_time}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{currentDetail.end_time}</Descriptions.Item>
              <Descriptions.Item label="价格">{currentDetail.price} 元</Descriptions.Item>
              <Descriptions.Item label="最大人数">{currentDetail.max_people}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{currentDetail.contact}</Descriptions.Item>
              <Descriptions.Item label="项目描述">{currentDetail.description}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

      <Modal title={`${currentTag ? '编辑' : '新增'}标签`} open={tagModalVisible} onCancel={() => setTagModalVisible(false)} footer={null}>
        <Form form={tagForm} layout="vertical" onFinish={handleSaveTag}>
          <Form.Item name="name" label="标签名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sort_num" label="排序"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setTagModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </div>
        </Form>
      </Modal>

      <Modal title={`${currentCate ? '编辑' : '新增'}分类`} open={cateModalVisible} onCancel={() => setCateModalVisible(false)} footer={null}>
        <Form form={cateForm} layout="vertical" onFinish={handleSaveCate}>
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="sort_num" label="排序"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCateModalVisible(false)}>取消</Button>
              <Button type="primary" htmlType="submit">保存</Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </Layout>
  );
};

export default AdminProjectManage;