import React, { useState, useRef, useEffect } from "react";
import { Card, Typography, List, Tag, Space, Button, Empty, Skeleton, message, Progress, Divider, Input, Avatar } from "antd";
import { FiCpu, FiTrendingUp, FiPhoneCall, FiMessageSquare, FiCheckCircle, FiRefreshCw, FiZap, FiSend, FiUser } from "react-icons/fi";
import { useGetLeadAiSuggestionsQuery, useChatWithLeadAiMutation, useGetLeadAiChatHistoryQuery } from "../../services/LeadApi";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const LeadAI = ({ leadId, leadData }) => {
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you close this lead today?' }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isPlanning, setIsPlanning] = useState(false);
  const [lastFailedMessage, setLastFailedMessage] = useState(null);
  const [currentThought, setCurrentThought] = useState("");
  const [currentPlan, setCurrentPlan] = useState("");
  const isSendingRef = useRef(false);
  const chatEndRef = useRef(null);
  const [chatWithAi, { isLoading: isChatLoading }] = useChatWithLeadAiMutation();

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isThinking, isPlanning]);

  const { 
    data: suggestionsResponse, 
    isLoading, 
    isFetching,
    refetch, 
    error 
  } = useGetLeadAiSuggestionsQuery(leadId);

  const { 
    data: historyResponse, 
    isLoading: isHistoryLoading,
    refetch: refetchHistory
  } = useGetLeadAiChatHistoryQuery(leadId);

  useEffect(() => {
    if (historyResponse?.success && historyResponse.data && historyResponse.data.length > 0) {
      const formattedHistory = historyResponse.data.map(chat => {
        let content = chat.message;
        
        // Handle potential JSON string in ai_response_data
        let aiResponseData = chat.ai_response_data;
        if (typeof aiResponseData === 'string') {
          try {
            aiResponseData = JSON.parse(aiResponseData);
          } catch (e) {
            console.error("Error parsing ai_response_data:", e);
          }
        }

        return {
          role: chat.role,
          content: chat.role === 'assistant' && aiResponseData ? aiResponseData : chat.message
        };
      });
      
      const mergedHistory = [
        { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you close this lead today?' },
        ...formattedHistory
      ];

      // Deduplicate repeated role+content messages (observed in some refresh/refetch flows)
      const deduped = [];
      const seen = new Set();
      for (const msg of mergedHistory) {
        const normalizedContent = typeof msg.content === "object"
          ? JSON.stringify(msg.content)
          : String(msg.content || "");
        const key = `${msg.role}::${normalizedContent}`;
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(msg);
        }
      }

      // Collapse accidental consecutive assistant duplicates; keep latest one
      const collapsed = [];
      for (const msg of deduped) {
        const prev = collapsed[collapsed.length - 1];
        if (prev && prev.role === "assistant" && msg.role === "assistant") {
          collapsed[collapsed.length - 1] = msg;
        } else {
          collapsed.push(msg);
        }
      }

      setChatHistory(collapsed);
    }
  }, [historyResponse]);

  const aiData = suggestionsResponse?.data || {};
  const suggestions = aiData.suggestions || [];
  const leadScore = aiData.score || 0;
  const leadSummary = aiData.summary || "";
  const suggestionsErrorMessage =
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    (typeof error?.data === "string" ? error.data : "");

  // Helper: Convert plain text to structured React component if needed
  const renderAiContent = (content) => {
    if (!content) return null;
    
    // If it's a structured AI response object, render it
    if (typeof content === 'object') {
      const { strategy, actions, script } = content;
      const actionsList = (actions || []).map(a => a.replace(/^-/, "").trim());

      return (
        <div className="ai-bot-response-card">
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>💡 Strategy</div>
            <div style={{ color: "#475569" }}>{strategy || ''}</div>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>✅ Actions</div>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#475569" }}>
              {actionsList.map((action, i) => (
                <li key={i}>{action}</li>
              ))}
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "#1e293b", marginBottom: "4px" }}>💬 Script</div>
            <div style={{ background: "#eef2ff", padding: "12px", borderRadius: "8px", border: "1px solid #c7d2fe", color: "#3730a3", fontStyle: "italic" }}>
              {(script || '').replace(/"/g, "").trim()}
            </div>
            <Button 
              size="small" 
              icon={<FiMessageSquare />} 
              style={{ marginTop: "8px" }}
              onClick={() => {
                navigator.clipboard.writeText((script || '').replace(/"/g, "").trim());
                message.success("Script copied!");
              }}
            >
              Copy Script
            </Button>
          </div>
        </div>
      );
    }

    return <div style={{ color: "#475569" }}>{content}</div>;
  };

  const handleSendMessage = async (msg = chatMessage) => {
    if (!msg.trim()) return;
    if (isSendingRef.current) return;
    isSendingRef.current = true;

    // Only add to history if it's a new message, not a retry
    const isRetry = msg === lastFailedMessage;
    if (!isRetry) {
      setChatHistory(prev => [...prev, { role: 'user', content: msg }]);
    }
    
    setChatMessage("");
    setLastFailedMessage(null);
    setIsThinking(true);
    setCurrentThought("Analyzing lead context...");

    try {
      // Send only last 5 messages to the backend to save tokens
      const recentHistory = chatHistory.slice(-5).map(h => ({
        role: h.role,
        content: typeof h.content === 'object' ? h.content.strategy : h.content
      }));

      const response = await chatWithAi({ 
        id: leadId, 
        message: msg,
        history: recentHistory
      }).unwrap();

      if (response?.success && response.data) {
        const aiResponse = response.data;
        
        // Phase 1: Thinking
        setCurrentThought(aiResponse.thinking || "Analyzing data...");
        await new Promise(r => setTimeout(r, 1200));
        
        // Phase 2: Planning
        setIsThinking(false);
        setIsPlanning(true);
        setCurrentPlan(aiResponse.planning || "Formulating strategy...");
        await new Promise(r => setTimeout(r, 1200));
        
        // Final: refresh canonical history from server (single source of truth)
        setIsPlanning(false);
        await refetchHistory();
      } else {
        setIsThinking(false);
        setIsPlanning(false);
        setLastFailedMessage(msg);
        message.error("Failed to get AI response");
      }
    } catch (err) {
      console.error("Chat Error:", err);
      setIsThinking(false);
      setIsPlanning(false);
      setLastFailedMessage(msg);
      message.error("Error communicating with AI");
    } finally {
      isSendingRef.current = false;
    }
  }; 

  const handleGenerate = async () => {
    try {
      await refetch();
      message.success("AI Suggestions refreshed!");
    } catch (err) {
      message.error("Failed to refresh AI suggestions");
    }
  };

  const getIcon = (iconName) => {
    switch (iconName?.toLowerCase()) {
      case 'phone': return <FiPhoneCall />;
      case 'trending': return <FiTrendingUp />;
      case 'check': return <FiCheckCircle />;
      default: return <FiCpu />;
    }
  };

  return (
    <div className="lead-ai-overview" style={{ padding: "20px" }}>
      <Card
        title={
          <Space>
            <FiCpu style={{ color: "#1890ff" }} />
            <span>AI Sales Assistant</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            size="small" 
            icon={<FiRefreshCw className={isFetching ? 'ant-spin' : ''} />} 
            onClick={handleGenerate}
            loading={isFetching}
          >
            Regenerate
          </Button>
        }
        style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      >
        <div style={{ marginBottom: "20px" }}>
          <Text type="secondary">
            AI has analyzed this lead's data, notes, and activity history to provide you with actionable recommendations.
          </Text>
        </div>

        {isLoading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : error ? (
          <Empty 
            description={
              <span>
                <Text type="danger">
                  {suggestionsErrorMessage || "Unable to load AI suggestions right now."}
                </Text>
                <br />
                <Text type="secondary">
                  {suggestionsErrorMessage
                    ? "Please try again. If the issue persists, check backend logs."
                    : "Please check your network connection and API server."}
                </Text>
              </span>
            }
          >
            <Button 
              type="primary" 
              icon={<FiRefreshCw />} 
              onClick={handleGenerate} 
              loading={isFetching}
            >
              Retry Suggestions
            </Button>
          </Empty>
        ) : (
          <>
            <div style={{ display: "flex", gap: "24px", marginBottom: "24px", alignItems: "center" }}>
              <div style={{ textAlign: "center", background: "#f0f7ff", padding: "16px", borderRadius: "12px", minWidth: "140px" }}>
                <Title level={5} style={{ margin: "0 0 8px 0" }}>Lead Score</Title>
                <Progress 
                  type="circle" 
                  percent={leadScore} 
                  width={80} 
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <Title level={5} style={{ margin: "0 0 8px 0" }}>AI Summary</Title>
                <Paragraph style={{ fontSize: "15px", color: "#475569", margin: 0 }}>
                  {leadSummary}
                </Paragraph>
              </div>
            </div>

            <Divider orientation="left">Actionable Suggestions</Divider>

            {suggestions.length > 0 ? (
              <List
                grid={{ gutter: 16, column: 1 }}
                dataSource={suggestions}
                renderItem={(item) => (
                  <List.Item>
                    <Card
                      hoverable
                      style={{
                        borderRadius: "10px",
                        borderLeft: `4px solid ${item.priority === 'HIGH' ? '#ff4d4f' : item.priority === 'MEDIUM' ? '#faad14' : '#52c41a'}`,
                        background: "#f8fafc"
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Title level={5} style={{ margin: 0 }}>{item.title}</Title>
                          <Tag color={item.priority === 'HIGH' ? 'red' : item.priority === 'MEDIUM' ? 'orange' : 'green'}>
                            {item.priority}
                          </Tag>
                        </div>
                        
                        <div>
                          <Text strong>💡 Strategy</Text>
                          <Paragraph style={{ margin: "4px 0 0 0" }}>
                            {item.strategy?.replace(/^💡\s*/, "")}
                          </Paragraph>
                        </div>

                        <div>
                          <Text strong>✅ Actions</Text>
                          <ul style={{ paddingLeft: "20px", margin: "4px 0 0 0" }}>
                            {item.actions?.map((action, i) => (
                              <li key={i}>{action?.replace(/^✅\s*/, "")}</li>
                            ))}
                          </ul>
                        </div>

                        <div style={{ background: "#f0f5ff", padding: "12px", borderRadius: "8px", border: "1px solid #d6e4ff" }}>
                          <Text strong>💬 Suggested Script</Text>
                          <Paragraph style={{ margin: "4px 0 8px 0", fontStyle: "italic" }}>
                            {item.script?.replace(/^💬\s*/, "")}
                          </Paragraph>
                          <Button 
                            size="small" 
                            icon={<FiMessageSquare />} 
                            onClick={() => {
                              navigator.clipboard.writeText(item.script?.replace(/^💬\s*/, ""));
                              message.success("Script copied!");
                            }}
                          >
                            Copy Script
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            ) : (
              <Empty description="No suggestions found" />
            )}
          </>
        )}

        <Card
          style={{
            marginTop: "32px",
            background: "#ffffff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden"
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <Title level={5} style={{ margin: 0 }}>
              <FiMessageSquare style={{ marginRight: "8px" }} />
              Chat with AI Assistant
            </Title>
          </div>
          
          <div 
            style={{ height: "300px", overflowY: "auto", padding: "16px", background: "#ffffff" }}
          >
            {chatHistory.map((msg, index) => (
              <div 
                key={index} 
                style={{ 
                  display: "flex", 
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: "16px"
                }}
              >
                <div style={{ 
                  display: "flex", 
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  maxWidth: "80%",
                  gap: "8px"
                }}>
                  <Avatar 
                    icon={msg.role === 'user' ? <FiUser /> : <FiCpu />} 
                    style={{ backgroundColor: msg.role === 'user' ? '#1890ff' : '#87d068', flexShrink: 0 }} 
                  />
                  {msg.role === 'user' ? (
                    <div style={{ 
                      padding: "10px 14px", 
                      borderRadius: "12px", 
                      background: '#1890ff',
                      color: '#ffffff',
                      fontSize: "14px",
                      lineHeight: "1.5",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                    }}>
                      {msg.content}
                    </div>
                  ) : (
                    <div 
                      className="ai-message-bubble"
                      style={{ 
                        padding: "10px 14px", 
                        borderRadius: "12px", 
                        background: '#f1f5f9',
                        color: '#1e293b',
                        fontSize: "14px",
                        lineHeight: "1.5",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        width: "100%"
                      }}
                    >
                      {renderAiContent(msg.content)}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isThinking && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "flex-start" }}>
                <Avatar icon={<FiCpu />} style={{ backgroundColor: '#87d068' }} />
                <div style={{ padding: "10px 14px", borderRadius: "12px", background: "#f1f5f9", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" italic style={{ fontSize: "12px" }}>
                      Thinking...
                    </Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Text style={{ fontSize: "14px" }}>{currentThought}</Text>
                      <div className="typing-dots">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    </div>
                  </Space>
                </div>
              </div>
            )}

            {isPlanning && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px", alignItems: "flex-start" }}>
                <Avatar icon={<FiCpu />} style={{ backgroundColor: '#87d068' }} />
                <div style={{ padding: "10px 14px", borderRadius: "12px", background: "#f0fdf4", border: "1px solid #dcfce7", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                  <Space direction="vertical" size={4}>
                    <Text type="secondary" italic style={{ fontSize: "12px", color: "#166534" }}>
                      Planning...
                    </Text>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Text style={{ fontSize: "14px", color: "#166534" }}>{currentPlan}</Text>
                      <div className="typing-dots green">
                        <span>.</span><span>.</span><span>.</span>
                      </div>
                    </div>
                  </Space>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          <style>{`
            @keyframes blink {
              0% { opacity: .2; }
              20% { opacity: 1; }
              100% { opacity: .2; }
            }
            .typing-dots span {
              animation-name: blink;
              animation-duration: 1.4s;
              animation-iteration-count: infinite;
              animation-fill-mode: both;
              font-weight: bold;
              font-size: 18px;
              line-height: 0;
            }
            .typing-dots span:nth-child(2) { animation-delay: .2s; }
            .typing-dots span:nth-child(3) { animation-delay: .4s; }
            .typing-dots.green span { color: #166534; }
          `}</style>

          <div style={{ padding: "16px", borderTop: "1px solid #e2e8f0" }}>
            {lastFailedMessage && (
              <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>
                <Button 
                  size="small" 
                  danger 
                  icon={<FiRefreshCw />} 
                  onClick={() => handleSendMessage(lastFailedMessage)}
                >
                  Retry last message
                </Button>
              </div>
            )}
            <div style={{ display: "flex", gap: "8px" }}>
              <TextArea 
                placeholder="Ask me how to close this lead..." 
                autoSize={{ minRows: 1, maxRows: 4 }}
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isChatLoading || isThinking || isPlanning}
              />
              <Button 
                type="primary" 
                icon={<FiSend />} 
                onClick={() => handleSendMessage()}
                loading={isChatLoading || isThinking || isPlanning}
                disabled={!chatMessage.trim()}
              />
            </div>
          </div>
        </Card>
      </Card>
    </div>
  );
};

export default LeadAI;
