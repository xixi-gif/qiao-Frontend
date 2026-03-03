import React, { useState, useEffect } from 'react';
import { 
  Button, Card, Form, Input, InputNumber, Checkbox, 
  Select, List, Typography, Divider, Alert, Space, Tag, Descriptions
} from 'antd';
import axios from 'axios';
import { CompassOutlined, ClockCircleOutlined, EnvironmentOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const request = axios.create({
  baseURL: 'http://localhost:8090/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
});

request.interceptors.response.use(
  response => {
    const res = response.data;
    if (res.code !== 200) {
      Alert.error(res.message || '请求失败');
      return Promise.reject(res);
    }
    return res;
  },
  error => {
    console.error('请求错误：', error);
    Alert.error(error.message || '服务器错误');
    return Promise.reject(error);
  }
);

const api = {
  getAllThemes: () => request.get('/route/themes'),
  getResourcesByTheme: (themeId) => request.get(`/route/resources/${themeId}`),
  planRoute: (data) => request.post('/route/plan', data),
  evaluateRoute: (data) => request.post('/route/evaluate', data),
  healthCheck: () => request.get('/route/health')
};

const TravelAIPage = () => {
  const [healthStatus, setHealthStatus] = useState(null);
  const [themes, setThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState('');
  const [resources, setResources] = useState([]);
  const [routeResult, setRouteResult] = useState(null);
  const [evalResult, setEvalResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await api.healthCheck();
      setHealthStatus(res.data);
    } catch (err) {
      setHealthStatus({ status: 'error' });
    }
  };

  const getThemes = async () => {
    setLoading(true);
    try {
      const res = await api.getAllThemes();
      setThemes(res.data || []);
    } catch (err) {
      console.error('获取主题失败：', err);
    } finally {
      setLoading(false);
    }
  };

  const getResources = async () => {
    if (!selectedThemeId) return;
    setLoading(true);
    try {
      const res = await api.getResourcesByTheme(selectedThemeId);
      setResources(res.data || []);
    } catch (err) {
      console.error('获取资源失败：', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceClick = (id) => {
    form.setFieldsValue({ start_point_id: id });
  };

  const onPlanRoute = async () => {
    try {
      const formData = await form.validateFields();
      const reqData = {
        theme_id: selectedThemeId,
        start_point_id: formData.start_point_id,
        resource_types: formData.resource_types ? formData.resource_types.split(',').map(item => item.trim()) : null,
        max_points: formData.max_points,
        include_indirect: formData.include_indirect
      };
      setLoading(true);
      const res = await api.planRoute(reqData);
      setRouteResult(res.data);
      setEvalResult(null);
    } catch (err) {
      console.error('路径规划失败：', err);
    } finally {
      setLoading(false);
    }
  };

  const onEvaluateRoute = async () => {
    if (!routeResult) return;
    setLoading(true);
    try {
      const reqData = {
        route_data: routeResult,
        theme: themes.find(item => item.id === selectedThemeId) || {}
      };
      const res = await api.evaluateRoute(reqData);
      setEvalResult(res.data);
    } catch (err) {
      console.error('路径评估失败：', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>智能路径规划系统</Title>
      
      <Card style={{ marginBottom: '16px' }}>
        <Space>
          <Button onClick={checkHealth} type="primary">刷新服务状态</Button>
          {healthStatus ? (
            healthStatus.status === 'healthy' ? (
              <Alert message="服务运行正常" type="success" showIcon />
            ) : (
              <Alert message="服务异常" type="error" showIcon />
            )
          ) : (
            <Alert message="正在检查服务状态..." type="info" showIcon />
          )}
        </Space>
      </Card>

      <Divider orientation="left">主题管理</Divider>
      <Card style={{ marginBottom: '16px' }}>
        <Space>
          <Button onClick={getThemes} loading={loading} type="default">
            加载主题列表
          </Button>
          <Select
            placeholder="选择主题"
            value={selectedThemeId}
            onChange={setSelectedThemeId}
            style={{ width: 200 }}
          >
            {themes.map(theme => (
              <Option key={theme.id} value={theme.id}>
                {theme.name}
              </Option>
            ))}
          </Select>
          <Button onClick={getResources} loading={loading} disabled={!selectedThemeId}>
            加载主题资源
          </Button>
        </Space>

        <List
          style={{ marginTop: '16px' }}
          dataSource={resources}
          renderItem={item => (
            <List.Item 
              onClick={() => handleResourceClick(item.id)}
              style={{ cursor: 'pointer', border: '1px solid #f0f0f0', borderRadius: '4px', padding: '8px', marginBottom: '8px' }}
              hoverable
            >
              <List.Item.Meta
                title={`${item.name} (ID: ${item.id})`}
                description={
                  <Space>
                    <Tag icon={<EnvironmentOutlined />}>坐标: {item.lat}, {item.lon}</Tag>
                    <Tag icon={<ClockCircleOutlined />}>时长: {item.duration}</Tag>
                  </Space>
                }
              />
            </List.Item>
          )}
          locale={{ emptyText: '暂无资源数据' }}
        />
      </Card>

      <Divider orientation="left">路径规划</Divider>
      <Card style={{ marginBottom: '16px' }}>
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            max_points: 6,
            include_indirect: true
          }}
        >
          <Form.Item
            name="start_point_id"
            label="起点ID"
            rules={[{ required: true, message: '请输入起点ID' }]}
          >
            <Input placeholder="点击下方资源列表自动填充" prefix={<CompassOutlined />} />
          </Form.Item>

          <Form.Item
            name="resource_types"
            label="资源类型"
          >
            <Input placeholder="多个类型用逗号分隔（如：场馆,景点）" />
          </Form.Item>

          <Form.Item
            name="max_points"
            label="最大点数"
            rules={[{ required: true, message: '请输入最大点数' }]}
          >
            <InputNumber min={3} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="include_indirect"
            valuePropName="checked"
            label="包含间接资源"
          >
            <Checkbox />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              onClick={onPlanRoute} 
              loading={loading}
              disabled={!selectedThemeId}
              icon={<ThunderboltOutlined />}
            >
              生成路径规划
            </Button>
          </Form.Item>
        </Form>

        {routeResult && (
          <div style={{ marginTop: '24px', borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
            <Descriptions title="路径概览" column={2} bordered>
              <Descriptions.Item label="路径ID">{routeResult.route_id}</Descriptions.Item>
              <Descriptions.Item label="起点ID">{routeResult.start_point_id}</Descriptions.Item>
              <Descriptions.Item label="总距离">
                <Tag color="blue">{routeResult.total_distance} 公里</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="途经点数">
                <Tag color="green">{routeResult.point_count} 个</Tag>
              </Descriptions.Item>
            </Descriptions>

            <Title level={5} style={{ marginTop: '24px', marginBottom: '16px' }}>
              详细路线
            </Title>
            <List
              dataSource={routeResult.route}
              renderItem={(item, index) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <Space>
                      <Tag color={index === 0 ? 'red' : 'blue'}>
                        {index === 0 ? '起点' : `第 ${index + 1} 站`}
                      </Tag>
                      <div>
                        <Text strong>{item.name}</Text>
                        <br />
                        <Text type="secondary">ID: {item.id} | 坐标: {item.lat}, {item.lon} | 时长: {item.duration}</Text>
                      </div>
                    </Space>
                  </Card>
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>

      <Divider orientation="left">路径评估</Divider>
      <Card>
        <Button 
          type="default" 
          onClick={onEvaluateRoute} 
          loading={loading}
          disabled={!routeResult}
        >
          评估当前路径
        </Button>

        {evalResult && (
          <div style={{ marginTop: '16px' }}>
            <Title level={5}>评估结果</Title>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="主题匹配度">{evalResult.theme_match_score} 分</Descriptions.Item>
              <Descriptions.Item label="路径效率">{evalResult.route_efficiency}</Descriptions.Item>
              <Descriptions.Item label="节点多样性">{evalResult.point_diversity}</Descriptions.Item>
              <Descriptions.Item label="总距离">{evalResult.total_distance} 米</Descriptions.Item>
              <Descriptions.Item label="点数">{evalResult.point_count}</Descriptions.Item>
              <Descriptions.Item label="评估建议" span={2}>{evalResult.suggestion}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TravelAIPage;