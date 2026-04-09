import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Switch, InputNumber, message, Layout, Card, Typography, Tabs, Space, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Title } = Typography;
const { Content } = Layout;
const { TabPane } = Tabs;

const CarouselSettingPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [activeTab, setActiveTab] = useState('carousel');
  const [msgList, setMsgList] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgVisible, setMsgVisible] = useState(false);
  const [msgForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [imgList, setImgList] = useState([]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await api.carouselApi.getList({ skip: 0, limit: 100, is_active: null });
      setList(res.data);
    } catch (err) {
      message.error('加载失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchMsgList = async () => {
    setMsgLoading(true);
    try {
      const res = await api.messageApi.getList();
      setMsgList(res.data);
    } catch (err) {
      message.error('加载失败');
    } finally {
      setMsgLoading(false);
    }
  };

  const fetchMsgImages = async () => {
    try {
      const res = await api.messageApi.getImages();
      setImgList(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    if (activeTab === 'message') {
      fetchMsgList();
      fetchMsgImages();
    }
  }, [activeTab]);

  const handleAdd = () => {
    setEditId(null);
    form.resetFields();
    setFile(null);
    setPreview('');
    setVisible(true);
  };

  const handleEdit = (record) => {
    setEditId(record.id);
    form.setFieldsValue({
      title: record.title,
      description: record.description,
      link: record.link,
      sort_num: record.sort_num,
      is_active: record.is_active
    });
    setPreview(`http://127.0.0.1:8090${record.image_path}`);
    setFile(null);
    setVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.carouselApi.delete(id);
      message.success('删除成功');
      fetchList();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    const values = form.getFieldsValue();
    const formData = new FormData();
    formData.append('title', values.title);
    if (values.description) formData.append('description', values.description);
    if (values.link) formData.append('link', values.link);
    formData.append('sort_num', values.sort_num ?? 0);
    formData.append('is_active', values.is_active ?? true);
    if (file) formData.append('image', file);

    try {
      if (editId) {
        await api.carouselApi.update(editId, formData);
        message.success('修改成功');
      } else {
        await api.carouselApi.create(formData);
        message.success('添加成功');
      }
      setVisible(false);
      fetchList();
    } catch {
      message.error('提交失败');
    }
  };

  const handleSortChange = async (id, val) => {
    try {
      await api.carouselApi.updateSort(id, val);
      message.success('排序已更新');
      fetchList();
    } catch {
      message.error('排序失败');
    }
  };

  const handleMsgAdd = () => {
    msgForm.resetFields();
    setMsgVisible(true);
  };

  const handleMsgSubmit = async () => {
    const values = msgForm.getFieldsValue();
    try {
      await api.messageApi.create(values);
      message.success('添加成功');
      setMsgVisible(false);
      fetchMsgList();
    } catch {
      message.error('提交失败');
    }
  };

  const handleMsgDelete = async (id) => {
    try {
      await api.messageApi.delete(id);
      message.success('删除成功');
      fetchMsgList();
    } catch {
      message.error('删除失败');
    }
  };

  const handleMsgBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择数据');
      return;
    }
    try {
      await api.messageApi.batchDelete(selectedRowKeys);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchMsgList();
    } catch {
      message.error('批量删除失败');
    }
  };

  const columns = [
    { title: '排序', dataIndex: 'sort_num', width: 120, render: (s, r) => <InputNumber min={0} value={s} onChange={(v) => handleSortChange(r.id, v)} style={{width:'100%'}} /> },
    { title: '标题', dataIndex: 'title', width: 200 },
    { title: '图片', dataIndex: 'image_path', width: 140, render: u => <img src={`http://127.0.0.1:8090${u}`} style={{ height: 50 }} /> },
    { title: '链接', dataIndex: 'link', width: 400, render: (text) => <div style={{ wordBreak:'break-all', whiteSpace:'pre-wrap', lineHeight:1.6 }}>{text}</div> },
    { title: '状态', dataIndex: 'is_active', width: 120, render: a => a ? '启用' : '禁用' },
    {
      title: '操作', width: 200, render: r => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>删除</Button>
        </>
      )
    }
  ];

  const msgColumns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    { title: '留言人', dataIndex: 'name', width: 180 },
    { title: '头像', dataIndex: 'image', width: 140, render: u => <img src={u} style={{ height: 50, borderRadius: 4 }} /> },
    { title: '创建时间', dataIndex: 'create_time', width: 200 },
    { title: '操作', width: 150, render: r => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleMsgDelete(r.id)}>删除</Button> }
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys
  };

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Content style={{ padding: '30px 24px' }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} type="card" style={{ marginBottom: 20 }}>
            <TabPane tab="轮播图管理" key="carousel" />
            <TabPane tab="留言墙管理" key="message" />
          </Tabs>

          {activeTab === 'carousel' && (
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} title={<Title level={4} style={{ margin: 0, color: '#9C706A' }}>轮播图管理</Title>} extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ backgroundColor: '#9C706A', borderColor: '#9C706A' }}>新增轮播图</Button>}>
              <Table rowKey="id" columns={columns} dataSource={list} loading={loading} pagination={false} scroll={{ x: 'auto' }} />
            </Card>
          )}

          {activeTab === 'message' && (
            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }} title={<Title level={4} style={{ margin: 0, color: '#9C706A' }}>留言墙管理</Title>} extra={<Space><Button danger onClick={handleMsgBatchDelete}>批量删除</Button><Button type="primary" icon={<PlusOutlined />} onClick={handleMsgAdd} style={{ backgroundColor: '#9C706A', borderColor: '#9C706A' }}>新增留言</Button></Space>}>
              <Table rowSelection={rowSelection} rowKey="id" columns={msgColumns} dataSource={msgList} loading={msgLoading} pagination={false} scroll={{ x: 'auto' }} />
            </Card>
          )}
        </div>

        <Modal title={editId ? '编辑轮播图' : '新增轮播图'} open={visible} onCancel={() => setVisible(false)} onOk={handleSubmit} width={550} forceRender>
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="描述"><Input.TextArea rows={3} /></Form.Item>
            <Form.Item name="link" label="跳转链接"><Input /></Form.Item>
            <Form.Item name="sort_num" label="排序值"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
            <Form.Item name="is_active" label="启用状态" valuePropName="checked"><Switch defaultChecked /></Form.Item>
            <Form.Item label="上传图片">
              <Upload fileList={[]} beforeUpload={(f) => { setFile(f); setPreview(URL.createObjectURL(f)); return false; }}>
                <Button>选择图片</Button>
              </Upload>
              {preview && <img src={preview} style={{ width: '100%', marginTop: 10, borderRadius: 8 }} />}
            </Form.Item>
          </Form>
        </Modal>

        <Modal title="新增留言" open={msgVisible} onCancel={() => setMsgVisible(false)} onOk={handleMsgSubmit} width={500}>
          <Form form={msgForm} layout="vertical">
            <Form.Item name="name" label="留言人名称" rules={[{ required: true }]}><Input placeholder="请输入" /></Form.Item>
            <Form.Item name="image" label="头像地址" rules={[{ required: true }]}><Input placeholder="请输入图片URL" /></Form.Item>
            <Form.Item label="可选图片">
              <Row gutter={[8,8]}>{imgList.map((u, i) => <Col xs={6} key={i}><img src={u} style={{ width: '100%', borderRadius: 4, cursor: 'pointer' }} onClick={() => msgForm.setFieldsValue({ image: u })} /></Col>)}</Row>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default CarouselSettingPage