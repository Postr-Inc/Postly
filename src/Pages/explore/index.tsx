"use client"

import { createSignal, createMemo } from "solid-js"

function TopicsGrid(props) {
  const [subscribedTopics, setSubscribedTopics] = createSignal(new Set([1, 3, 7]))

  // Sample topics data
  const topics = [
    {
      id: 1,
      title: "Web Development",
      description: "Latest trends, frameworks, and best practices in web development",
      category: "tech",
      subscribers: 125400,
      posts: 2340,
      trending: true,
      color: "#3b82f6",
      icon: "code",
    },
    {
      id: 2,
      title: "Digital Art",
      description: "Showcase your digital artwork and discover amazing creations",
      category: "art",
      subscribers: 89200,
      posts: 5670,
      trending: true,
      color: "#f59e0b",
      icon: "palette",
    },
    {
      id: 3,
      title: "Machine Learning",
      description: "AI, ML algorithms, research papers, and practical applications",
      category: "tech",
      subscribers: 156700,
      posts: 1890,
      trending: false,
      color: "#10b981",
      icon: "brain",
    },
    {
      id: 4,
      title: "Photography",
      description: "Share your photos and learn from professional photographers",
      category: "art",
      subscribers: 203500,
      posts: 8920,
      trending: false,
      color: "#8b5cf6",
      icon: "camera",
    },
    {
      id: 5,
      title: "Startup Life",
      description: "Entrepreneurship, startup stories, and business insights",
      category: "business",
      subscribers: 67800,
      posts: 1230,
      trending: true,
      color: "#ef4444",
      icon: "rocket",
    },
    {
      id: 6,
      title: "Cooking & Recipes",
      description: "Delicious recipes, cooking tips, and food photography",
      category: "lifestyle",
      subscribers: 178900,
      posts: 4560,
      trending: false,
      color: "#f97316",
      icon: "chef",
    },
    {
      id: 7,
      title: "Mental Health",
      description: "Support, resources, and discussions about mental wellness",
      category: "health",
      subscribers: 94300,
      posts: 2780,
      trending: false,
      color: "#06b6d4",
      icon: "heart",
    },
    {
      id: 8,
      title: "Gaming",
      description: "Game reviews, streaming, esports, and gaming community",
      category: "entertainment",
      subscribers: 234600,
      posts: 6780,
      trending: true,
      color: "#a855f7",
      icon: "gamepad",
    },
    {
      id: 9,
      title: "Travel Stories",
      description: "Share your adventures and discover new destinations",
      category: "lifestyle",
      subscribers: 145200,
      posts: 3450,
      trending: false,
      color: "#14b8a6",
      icon: "map",
    },
    {
      id: 10,
      title: "Fitness & Wellness",
      description: "Workout routines, nutrition tips, and healthy lifestyle",
      category: "health",
      subscribers: 112800,
      posts: 2890,
      trending: true,
      color: "#84cc16",
      icon: "dumbbell",
    },
    {
      id: 11,
      title: "Book Club",
      description: "Book recommendations, reviews, and literary discussions",
      category: "education",
      subscribers: 76500,
      posts: 1670,
      trending: false,
      color: "#f43f5e",
      icon: "book",
    },
    {
      id: 12,
      title: "Climate Action",
      description: "Environmental awareness, sustainability, and climate solutions",
      category: "environment",
      subscribers: 58900,
      posts: 890,
      trending: true,
      color: "#22c55e",
      icon: "leaf",
    },
  ]

  // Filter topics based on search and category
  const filteredTopics = createMemo(() => {
    return topics.filter((topic) => {
      const matchesSearch =
        props.searchQuery === "" ||
        topic.title.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(props.searchQuery.toLowerCase())

      let matchesCategory = true
      if (props.selectedCategory === "trending") {
        matchesCategory = topic.trending
      } else if (props.selectedCategory === "new") {
        matchesCategory = topic.id > 8 // Simulate new topics
      } else if (props.selectedCategory === "popular") {
        matchesCategory = topic.subscribers > 100000
      }

      return matchesSearch && matchesCategory
    })
  })

  const toggleSubscription = (topicId) => {
    setSubscribedTopics((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(topicId)) {
        newSet.delete(topicId)
      } else {
        newSet.add(topicId)
      }
      return newSet
    })
  }

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  const renderIcon = (iconName, color) => {
    const iconProps = {
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
    }

    switch (iconName) {
      case "code":
        return (
          <svg {...iconProps}>
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
        )
      case "palette":
        return (
          <svg {...iconProps}>
            <circle cx="13.5" cy="6.5" r=".5"></circle>
            <circle cx="17.5" cy="10.5" r=".5"></circle>
            <circle cx="8.5" cy="7.5" r=".5"></circle>
            <circle cx="6.5" cy="12.5" r=".5"></circle>
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path>
          </svg>
        )
      case "brain":
        return (
          <svg {...iconProps}>
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"></path>
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z"></path>
            <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4"></path>
            <path d="M17.599 6.5a3 3 0 0 0 .399-1.375"></path>
            <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"></path>
            <path d="M3.477 10.896a4 4 0 0 1 .585-.396"></path>
            <path d="M19.938 10.5a4 4 0 0 1 .585.396"></path>
            <path d="M6 18a4 4 0 0 1-1.967-.516"></path>
            <path d="M19.967 17.484A4 4 0 0 1 18 18"></path>
          </svg>
        )
      case "camera":
        return (
          <svg {...iconProps}>
            <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
            <circle cx="12" cy="13" r="3"></circle>
          </svg>
        )
      case "rocket":
        return (
          <svg {...iconProps}>
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
            <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
            <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path>
            <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path>
          </svg>
        )
      case "chef":
        return (
          <svg {...iconProps}>
            <path d="M6 2c1.306 0 2.418.835 2.83 2H14a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2H8.83A3.001 3.001 0 0 1 6 11a3 3 0 0 1-2.83-2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1.17A3.001 3.001 0 0 1 6 2z"></path>
            <path d="M6 15v7"></path>
            <path d="M21 15v7"></path>
            <path d="M21 11V8a2 2 0 0 0-2-2h-5.17A3.001 3.001 0 0 0 11 4a3 3 0 0 0-2.83 2H3a2 2 0 0 0-2 2v3"></path>
          </svg>
        )
      case "heart":
        return (
          <svg {...iconProps}>
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        )
      case "gamepad":
        return (
          <svg {...iconProps}>
            <line x1="6" y1="12" x2="10" y2="12"></line>
            <line x1="8" y1="10" x2="8" y2="14"></line>
            <line x1="15" y1="13" x2="15.01" y2="13"></line>
            <line x1="18" y1="11" x2="18.01" y2="11"></line>
            <rect x="2" y="6" width="20" height="12" rx="2"></rect>
          </svg>
        )
      case "map":
        return (
          <svg {...iconProps}>
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
        )
      case "dumbbell":
        return (
          <svg {...iconProps}>
            <path d="M14.4 14.4 9.6 9.6"></path>
            <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829l-2.828 2.828z"></path>
            <path d="M21.5 21.5l-1.4-1.4"></path>
            <path d="M3.9 3.9l1.4 1.4"></path>
            <path d="M6.404 12.768a2 2 0 1 1-2.829-2.829l1.768-1.767a2 2 0 1 1-2.828-2.829l2.828-2.828a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829l-6.364 6.364z"></path>
          </svg>
        )
      case "book":
        return (
          <svg {...iconProps}>
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        )
      case "leaf":
        return (
          <svg {...iconProps}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
            <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"></path>
          </svg>
        )
      default:
        return (
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        )
    }
  }

  return (
    <div class="topics-container">
      {filteredTopics().length > 0 ? (
        <div class="topics-grid">
          {filteredTopics().map((topic) => (
            <div class="topic-card" key={topic.id}>
              <div class="topic-header">
                <div class="topic-icon" style={`background-color: ${topic.color}20`}>
                  {renderIcon(topic.icon, topic.color)}
                </div>
                {topic.trending && (
                  <div class="trending-badge">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                      <polyline points="17 6 23 6 23 12"></polyline>
                    </svg>
                    Trending
                  </div>
                )}
              </div>

              <div class="topic-content">
                <h3 class="topic-title">{topic.title}</h3>
                <p class="topic-description">{topic.description}</p>

                <div class="topic-stats">
                  <div class="stat">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>{formatNumber(topic.subscribers)} subscribers</span>
                  </div>
                  <div class="stat">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    <span>{formatNumber(topic.posts)} posts</span>
                  </div>
                </div>
              </div>

              <div class="topic-actions">
                <button
                  class={subscribedTopics().has(topic.id) ? "subscribe-btn subscribed" : "subscribe-btn"}
                  onClick={() => toggleSubscription(topic.id)}
                >
                  {subscribedTopics().has(topic.id) ? (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Subscribed
                    </>
                  ) : (
                    <>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Subscribe
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div class="no-results">
          <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            <line x1="8" y1="11" x2="14" y2="11"></line>
          </svg>
          <h3>No topics found</h3>
          <p>Try adjusting your search or browse different categories.</p>
        </div>
      )}
    </div>
  )
}

export default TopicsGrid
