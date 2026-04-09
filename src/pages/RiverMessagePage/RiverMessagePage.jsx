import React, { useState, useEffect } from "react";
import { Card, Input, Button, Space, Typography, Layout, Row, Col, message } from "antd";
import Navbar from "../../../public/Nav/nav";
import api from "../../service/api";

const RiverMessagePage = () => {
  const [name, setName] = useState("");
  const [images, setImages] = useState([]);
  const [selectedImg, setSelectedImg] = useState("");
  const [ducks, setDucks] = useState([]);

  const loadImages = async () => {
    try {
      const res = await api.riverApi.getRiverImages();
      setImages(res.data || []);
    } catch (err) {
      console.log("图片加载失败");
    }
  };

  const loadMessages = async () => {
    try {
      const res = await api.riverApi.getRiverMessages();
      const formatted = (res.data || []).map((item) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        x: Math.random() * 70 + 15,
        y: Math.random() * 55 + 10,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        moveTimer: Math.random() * 80 + 40,
        isStopped: false,
        jump: 0,
      }));
      setDucks(formatted);
    } catch (err) {
      message.error("加载留言板失败");
    }
  };

  const addDuck = async () => {
    if (!name.trim()) return message.warning("请输入名字");
    if (!selectedImg) return message.warning("请选择图片");
    try {
      await api.riverApi.addRiverMessage({ name, image: selectedImg });
      message.success("留言成功");
      setName("");
      setSelectedImg("");
      loadMessages();
    } catch (e) {
      message.error("提交失败");
    }
  };

  useEffect(() => {
    loadImages();
    loadMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setDucks(prev =>
        prev.map(d => {
          let newMove = d.moveTimer - 1;
          let newStopped = d.isStopped;
          let newVx = d.vx;
          let newVy = d.vy;
          let newJump = d.jump;

          if (newMove <= 0) {
            newStopped = Math.random() > 0.6;
            newMove = Math.random() * 90 + 30;
            if (!newStopped) {
              newVx = (Math.random() - 0.5) * 0.7;
              newVy = (Math.random() - 0.5) * 0.7;
            }
            newJump = Math.random() > 0.5 ? 3 : 0;
          }

          let nx = d.x;
          let ny = d.y;

          if (!newStopped) {
            nx = d.x + newVx;
            ny = d.y + newVy;
          }

          if (nx < 10 || nx > 85) newVx = -newVx;
          if (ny < 8 || ny > 75) newVy = -newVy;

          return {
            ...d,
            x: nx,
            y: ny,
            vx: newVx,
            vy: newVy,
            moveTimer: newMove,
            isStopped: newStopped,
            jump: newJump > 0 ? newJump - 1 : 0
          };
        })
      );
    }, 60);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", background: "#f7f8fa" }}>
      <Navbar />
      <div style={{ padding: 16, width: "100%" }}>
        <div style={{ textAlign: "center" }}>
          <Typography.Title level={2}>侨乡留念墙</Typography.Title>
        </div>

        <Row gutter={16}>
          <Col span={20}>
            <Card bordered={false} style={{ borderRadius: 16 }} bodyStyle={{ padding: 0 }}>
              <div
                style={{
                  width: "100%",
                  height: "calc(100vh - 220px)",
                  backgroundImage: "url('/img/3.png')",
                  backgroundSize: "cover",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {ducks.map((d) => (
                  <div
                    key={d.id}
                    style={{
                      position: "absolute",
                      left: `${d.x}%`,
                      top: `${d.y - d.jump}%`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.06s linear",
                    }}
                  >
                    <div
                      style={{
                        background: "rgba(255,255,255,0.98)",
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 500,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {d.name}
                    </div>
                    <img
                      src={d.image}
                      alt=""
                      style={{
                        width: 62,
                        height: 62,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #fff",
                        boxShadow: "0 3px 12px rgba(0,0,0,0.25)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </Card>
          </Col>

          <Col span={4}>
            <Card style={{ height: "calc(100vh - 370px)", borderRadius: 16 }}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Typography.Title level={4}>写下留言</Typography.Title>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="你的名字"
                  size="large"
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {images.map((src, i) => (
                    <img
                      key={i}
                      src={src}
                      style={{
                        width: "100%",
                        height: 50,
                        objectFit: "cover",
                        borderRadius: "50%",
                        cursor: "pointer",
                        border: selectedImg === src ? "3px solid #9C706A" : "2px solid transparent",
                      }}
                      onClick={() => setSelectedImg(src)}
                    />
                  ))}
                </div>
                <Button
                  type="primary"
                  block
                  size="large"
                  onClick={addDuck}
                  style={{ background: "#9C706A", border: "none" }}
                >
                  确认留名
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default RiverMessagePage;