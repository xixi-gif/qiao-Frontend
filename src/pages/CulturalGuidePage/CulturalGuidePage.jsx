import React, { useState, useEffect, useRef } from 'react';
import { Button, Space, Image, Layout, Spin, message } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import HTMLFlipBook from 'react-pageflip';
import api from '../../service/api';
import Navbar from '../../../public/Nav/nav';

const { Content } = Layout;

const CulturalGuidePage = () => {
  const bookRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await api.studyApi.getImages();
        const sorted = res.data.images.sort((a, b) => {
          const n1 = parseInt(a.replace(/\D/g, ''));
          const n2 = parseInt(b.replace(/\D/g, ''));
          return n1 - n2;
        });
        setImages(sorted);
      } catch (e) {
        message.error('加载失败');
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, []);

  const prevPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipPrev();
    }
  };

  const nextPage = () => {
    if (bookRef.current) {
      bookRef.current.pageFlip().flipNext();
    }
  };

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F5F2' }}>
        <Navbar />
        <Content style={{ padding: '100px 0', textAlign: 'center' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', backgroundColor: '#F8F5F2' }}>
      <Navbar />

      <Content style={{ padding: '60px 0 0 0', margin: '0 auto', maxWidth: '50vw' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '750px' }}>
          <HTMLFlipBook
            ref={bookRef}
            width={770}
            height={1080}
            size="stretch"
            autoCenter={true}
            startPage={0}
            flipDirection="rtl"
            flipDuration={500}
            drawShadow={true}
            maxShadowOpacity={0.2}
            pagePadding={0}
            showCover={true}
            usePortrait={false}
            startZIndex={10}
          >
            {images.map((item, index) => (
              <div key={index} style={{ width: '100%', height: '100%' }}>
                <Image
                  width="100%"
                  height="100%"
                  style={{ objectFit: 'contain', background: '#000' }}
                  src={`http://127.0.0.1:8090${item}`}
                  preview={false}
                />
              </div>
            ))}
          </HTMLFlipBook>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, width: '100%' }}>
          <Space size="large">
            <Button size="large" icon={<LeftOutlined />} onClick={prevPage} style={{ borderRadius: 10, backgroundColor: '#9C706A', color: '#fff', border: 0, width: 140 }}>上一页</Button>
            <Button size="large" icon={<RightOutlined />} onClick={nextPage} style={{ borderRadius: 10, backgroundColor: '#9C706A', color: '#fff', border: 0, width: 140 }}>下一页</Button>
          </Space>
        </div>
      </Content>
    </Layout>
  );
};

export default CulturalGuidePage;