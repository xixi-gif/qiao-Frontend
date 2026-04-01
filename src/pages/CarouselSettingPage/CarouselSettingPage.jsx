import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Upload, Switch, InputNumber, message, Layout } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const CarouselSettingPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

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

  useEffect(() => {
    fetchList();
  }, []);

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
    setPreview(record.image_path);
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

  const columns = [
    { title: '排序', dataIndex: 'sort_num', width: 100, render: (s, r) => <InputNumber min={0} value={s} onChange={(v) => handleSortChange(r.id, v)} /> },
    { title: '标题', dataIndex: 'title' },
    { title: '图片', dataIndex: 'image_path', render: u => <img src={`http://127.0.0.1:8090${u}`} style={{ height: 40 }} /> },
    { title: '链接', dataIndex: 'link' },
    { title: '状态', dataIndex: 'is_active', render: a => a ? '启用' : '禁用' },
    {
      title: '操作', width: 200, render: r => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(r)}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(r.id)}>删除</Button>
        </>
      )
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#f9f9f9' }}>
      <Navbar />
      <div style={{ padding: 20 }}>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新增轮播图</Button>
        </div>
        <Table rowKey="id" columns={columns} dataSource={list} loading={loading} pagination={false} />

        <Modal
          title={editId ? '编辑轮播图' : '新增轮播图'}
          open={visible}
          onCancel={() => setVisible(false)}
          onOk={handleSubmit}
          forceRender
        >
          <Form form={form} layout="vertical">
            <Form.Item name="title" label="标题" rules={[{ required: true }]}><Input /></Form.Item>
            <Form.Item name="description" label="描述"><Input.TextArea /></Form.Item>
            <Form.Item name="link" label="跳转链接"><Input /></Form.Item>
            <Form.Item name="sort_num" label="排序值"><InputNumber min={0} /></Form.Item>
            <Form.Item name="is_active" label="启用状态" valuePropName="checked"><Switch defaultChecked /></Form.Item>
            <Form.Item label="上传图片">
              <Upload
                fileList={[]}
                beforeUpload={(f) => { setFile(f); setPreview(URL.createObjectURL(f)); return false; }}
              >
                <Button>选择图片</Button>
              </Upload>
              {preview && <img src={preview.startsWith('http') ? preview : `http://127.0.0.1:8090${preview}`} style={{ width: '100%', marginTop: 10 }} />}
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </Layout>
  );
};

export default CarouselSettingPage;