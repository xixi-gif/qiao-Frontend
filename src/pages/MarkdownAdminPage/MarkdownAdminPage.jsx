import React, { useState, useEffect } from 'react';
import { Table, Button, Input, message, Upload, Modal, Space, Typography, Layout, Card } from "antd";
import { PlusOutlined, DeleteOutlined, EyeOutlined, UploadOutlined } from "@ant-design/icons";
import MDEditor from "@uiw/react-md-editor";
import api from "../../service/api";
import Navbar from '../../../public/Nav/nav';

const { Title } = Typography;
const { Content } = Layout;

const MarkdownAdminPage = () => {
  const [list, setList] = useState([]);
  const [visible, setVisible, setCacheFiles] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [id, setId] = useState(null);
  const [cacheFiles, setCacheFilesState] = useState([]);

  const load = async () => {
    const res = await api.markdownApi.getList();
    setList(res.data);
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
      message.success("批量上传成功！图片已自动插入");
      setCacheFilesState([]);
      load();
    } catch (err) {
      message.error("上传失败");
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Navbar />
      <Layout>
        <Content style={{ padding: "24px", overflow: "auto", height: "calc(100vh - 64px)" }}>
          <Title level={3}>文档管理</Title>

          <Card style={{ marginTop: 16 }}>
            <Upload
              drag
              multiple
              accept=".md,.png,.jpg,.jpeg,.gif,.webp"
              fileList={cacheFiles}
              showUploadList={true}
              beforeUpload={() => false}
              onChange={(info) => {
                setCacheFilesState(info.fileList);
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '20px'
              }}>
                <UploadOutlined style={{ fontSize: 28, marginBottom: 12 }} />
                <h4 style={{ margin: 0 }}>点击或拖拽文件到此处</h4>
                <p style={{ margin: 0, marginTop: 4 }}>支持批量上传 .md + 同名图片自动匹配</p>
              </div>
            </Upload>

            {cacheFiles.length > 0 && (
              <Button type="primary" style={{ marginTop: 16 }} onClick={handleConfirmUpload}>
                确认上传
              </Button>
            )}
          </Card>

          <div style={{ marginTop: 16 }}>
            <Table
              dataSource={list}
              rowKey="id"
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