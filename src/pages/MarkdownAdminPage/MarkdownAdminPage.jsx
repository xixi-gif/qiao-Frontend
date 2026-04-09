import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Upload, Modal, Space, Typography, Layout, Card, Pagination } from "antd";
import { DeleteOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import api from "../../service/api";
import Navbar from '../../../public/Nav/nav';

const { Title } = Typography;
const { Content } = Layout;

const MarkdownAdminPage = () => {
  const [list, setList] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [id, setId] = useState(null);
  const [cacheFiles, setCacheFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchKey, setSearchKey] = useState('');

  const load = async () => {
    const skip = (page - 1) * size;
    const res = await api.markdownApi.getAdminList({ skip, limit: size, title: searchKey });
    setTotal(res.data.total);
    setList(res.data.items);
  };

  const save = async () => {
    if (!title || !content) {
      message.warning('必填');
      return;
    }
    if (id) {
      await api.markdownApi.update(id, { title, content });
    } else {
      await api.markdownApi.create({ title, content });
    }
    message.success('成功');
    setVisible(false);
    load();
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.markdownApi.uploadImage(formData);
    return res.data.url;
  };

  const handleConfirmUpload = async () => {
    if (cacheFiles.length === 0) {
      message.warning("请先添加文件");
      return;
    }
    const formData = new FormData();
    cacheFiles.forEach(item => {
      formData.append('files', item.originFileObj || item);
    });
    try {
      await api.markdownApi.batchUpload(formData);
      message.success("批量上传成功！");
      setCacheFiles([]);
      load();
    } catch (err) {
      message.error("上传失败");
    }
  };

  useEffect(() => {
    load();
  }, [page, size, searchKey]);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: '#f9f5f1' }}>
      <Navbar />
      <Layout>
        <Content style={{ padding: "30px 24px", overflow: "auto", height: "calc(100vh - 64px)" }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={3} style={{ margin: 0, color: '#9C706A' }}>文档管理</Title>
              <Input
                placeholder="搜索标题"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                style={{ width: 280 }}
                allowClear
              />
            </div>

            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
              <Upload
                drag
                multiple
                accept=".md,.png,.jpg,.jpeg,.gif,.webp"
                fileList={cacheFiles}
                showUploadList={true}
                beforeUpload={() => false}
                onChange={(info) => {
                  setCacheFiles(info.fileList);
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                  <UploadOutlined style={{ fontSize: 28, marginBottom: 12, color: '#9C706A' }} />
                  <h4 style={{ margin: 0 }}>点击或拖拽文件到此处</h4>
                  <p style={{ margin: 0, marginTop: 4 }}>支持批量上传 .md + 同名图片自动匹配</p>
                </div>
              </Upload>
              {cacheFiles.length > 0 && (
                <Button type="primary" style={{ marginTop: 16, backgroundColor: '#9C706A', borderColor: '#9C706A' }} onClick={handleConfirmUpload}>
                  确认上传
                </Button>
              )}
            </Card>

            <Card style={{ borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Table
                dataSource={list}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: '标题', dataIndex: 'title' },
                  { title: '时间', dataIndex: 'created_at' },
                  {
                    title: '操作', render: (_, r) => (
                      <Space>
                        <Button icon={<EyeOutlined />} onClick={() => {
                          setId(r.id);
                          setTitle(r.title);
                          setContent(r.content);
                          setVisible(true);
                        }}>编辑</Button>
                        <Button danger icon={<DeleteOutlined />} onClick={async () => {
                          await api.markdownApi.delete(r.id);
                          message.success('删除成功');
                          load();
                        }}>删除</Button>
                      </Space>
                    )
                  }
                ]}
              />
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <Pagination
                  current={page}
                  pageSize={size}
                  total={total}
                  onChange={setPage}
                  onShowSizeChange={(current, pageSize) => {
                    setPage(1);
                    setSize(pageSize);
                  }}
                  showSizeChanger
                  pageSizeOptions={["10", "20", "50", "100"]}
                  showTotal={(total) => `共 ${total} 条`}
                />
              </div>
            </Card>
          </div>

          <Modal
            open={visible}
            title="编辑文档"
            onCancel={() => setVisible(false)}
            onOk={save}
            width={900}
          >
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="标题" style={{ marginBottom: 16 }} />
            <MDEditor value={content} onChange={setContent} uploadImage={uploadImage} height={500} />
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default MarkdownAdminPage;