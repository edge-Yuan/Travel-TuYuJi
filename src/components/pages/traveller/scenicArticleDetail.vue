<template>
  <div class="scenic-article-detail">
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item to="/traveller/attractions">景点推荐</el-breadcrumb-item>
      <el-breadcrumb-item>文章详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 加载状态 -->
    <el-skeleton v-if="loading" animated :rows="8" style="padding: 20px" />

    <!-- 文章内容 -->
    <div v-else-if="article">
      <el-card class="article-card" shadow="never">
        <div class="article-header">
          <div class="title">{{ article.title }}</div>
          <div class="meta">
            <el-tag size="mini" type="success" v-if="article.featured">精选</el-tag>
            <el-tag size="mini">{{ article.region }}</el-tag>
            <span class="dot" />
            <span>{{ article.merchantName }}</span>
            <span class="dot" />
            <span>{{ formatTime(article.publishTime) }}</span>
            <span class="dot" />
            <span>{{ article.viewCount }} 次浏览</span>
          </div>
        </div>
        <div class="cover">
          <img :src="article.cover" alt="cover" />
        </div>
        <div class="content" v-html="article.content"></div>
      </el-card>

      <!-- 相关套餐 -->
      <el-card class="packages-card" shadow="never" v-if="packages && packages.length > 0">
        <div class="section-title">相关套餐</div>
        <div class="pkg-list">
          <el-card v-for="pkg in packages" :key="pkg.relId" class="pkg-card" shadow="hover">
            <div class="pkg">
              <img :src="pkg.packageImage || pkg.mainImgUrl" class="pkg-image" />
              <div class="pkg-info">
                <div class="pkg-name">{{ pkg.packageName }}</div>
                <div class="pkg-meta">
                  <span class="price">¥{{ pkg.packagePrice || pkg.price }}</span>
                  <el-button type="primary" size="mini" @click="goPackage(pkg)">查看套餐</el-button>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </el-card>
    </div>

    <!-- 文章不存在 -->
    <el-empty v-else description="文章不存在或已被删除" />
  </div>
</template>

<script>
import request from '@/utils/request';

export default {
  name: 'scenicArticleDetail',
  data() {
    return {
      loading: false,
      article: null,
      packages: [],
    };
  },
  created() {
    this.loadArticle();
  },
  methods: {
    async loadArticle() {
      const articleId = this.$route.params.id;
      if (!articleId) {
        this.$message.error('文章ID不能为空');
        return;
      }

      this.loading = true;
      try {
        // 获取文章详情
        const articleResponse = await request.get(`/travel-portal/scenic-recommend/articles/${articleId}`);
        this.article = articleResponse.data.article;
        
        // 获取文章关联套餐
        const packagesResponse = await request.get(`/travel-portal/scenic-recommend/articles/${articleId}`);
        this.packages = packagesResponse.data.packages || [];
        
      } catch (error) {
        console.error('获取文章详情失败:', error);
        // 使用模拟数据作为后备
        this.loadMockArticle(articleId);
      } finally {
        this.loading = false;
      }
    },
    formatTime(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    goPackage(pkg) {
      this.$router.push({ path: '/traveller/packageDetail', query: { id: pkg.productId } });
    },
    
    // 加载模拟文章数据
    loadMockArticle(articleId) {
      const mockArticles = {
        '1': {
          articleId: 1,
          title: '北京故宫深度游：探寻紫禁城的千年历史',
          content: `
            <p>故宫，这座承载着明清两代帝王梦想的宫殿，每一砖一瓦都诉说着历史的沧桑。跟随我们的脚步，一起探寻这座世界文化遗产的奥秘。</p>
            <p>故宫始建于明永乐四年（1406年），至永乐十八年（1420年）建成，是明清两代的皇家宫殿。它位于北京中轴线的中心，是中国古代宫廷建筑之精华。</p>
            <p>故宫以三大殿为中心，占地面积约72万平方米，建筑面积约15万平方米，有大小宫殿七十多座，房屋九千余间。是世界上现存规模最大、保存最为完整的木质结构古建筑群。</p>
            <p>游览故宫，您将看到：</p>
            <ul>
              <li>太和殿：皇帝举行大典的地方</li>
              <li>中和殿：皇帝休息和准备的地方</li>
              <li>保和殿：皇帝举行宴会的地方</li>
              <li>乾清宫：皇帝的寝宫</li>
              <li>坤宁宫：皇后的寝宫</li>
            </ul>
            <p>每一座宫殿都有其独特的历史故事和文化内涵，等待着您的探索。</p>
          `,
          cover: require('@/assets/images/travel.jpg'),
          region: '华北',
          merchantName: '北京旅行社',
          publishTime: '2024-01-15T10:30:00Z',
          featured: true,
          viewCount: 1256
        },
        '2': {
          articleId: 2,
          title: '杭州西湖：人间天堂的诗意之旅',
          content: `
            <p>西湖，这个被无数文人墨客赞颂的地方，以其秀美的山水和深厚的文化底蕴，成为了杭州最亮丽的名片。让我们一同感受这份诗意。</p>
            <p>西湖位于浙江省杭州市西湖区龙井路1号，杭州市区西部，是中国主要的观赏性淡水湖泊，也是中国首批国家重点风景名胜区。</p>
            <p>西湖有十大名景：苏堤春晓、曲院风荷、平湖秋月、断桥残雪、花港观鱼、柳浪闻莺、三潭印月、双峰插云、雷峰夕照、南屏晚钟。</p>
            <p>游览西湖的最佳方式：</p>
            <ul>
              <li>步行：沿着苏堤、白堤漫步，感受湖光山色</li>
              <li>游船：乘坐画舫，从不同角度欣赏西湖美景</li>
              <li>骑行：环湖骑行，体验杭州的慢生活</li>
              <li>登山：登上雷峰塔，俯瞰整个西湖</li>
            </ul>
            <p>无论何时来到西湖，都能感受到那份独特的江南韵味。</p>
          `,
          cover: require('@/assets/images/travel4.jpg'),
          region: '华东',
          merchantName: '杭州文旅公司',
          publishTime: '2024-01-12T14:20:00Z',
          featured: false,
          viewCount: 892
        },
        '3': {
          articleId: 3,
          title: '成都宽窄巷子：品味巴蜀文化的慢生活',
          content: `
            <p>宽窄巷子，成都最具代表性的历史文化街区，这里不仅有传统的川西民居，更有地道的成都美食和悠闲的生活节奏。</p>
            <p>宽窄巷子由宽巷子、窄巷子和井巷子三条平行排列的城市老式街道及其之间的四合院群落组成，是成都遗留下来的较成规模的清朝古街道。</p>
            <p>在这里，您可以：</p>
            <ul>
              <li>品尝地道的川菜和小吃</li>
              <li>体验传统的茶文化</li>
              <li>购买精美的工艺品</li>
              <li>感受成都的慢生活节奏</li>
            </ul>
            <p>宽窄巷子不仅是成都的历史文化名片，更是现代成都人生活方式的体现。在这里，传统与现代完美融合，历史与时尚相得益彰。</p>
          `,
          cover: require('@/assets/images/travel6.jpg'),
          region: '西南',
          merchantName: '成都旅游集团',
          publishTime: '2024-01-10T09:15:00Z',
          featured: true,
          viewCount: 743
        }
      };
      
      const mockPackages = {
        '1': [
          {
            relId: 1,
            productId: 101,
            packageName: '故宫一日游',
            packagePrice: 299,
            packageImage: require('@/assets/images/travel2.jpg'),
            mainImgUrl: require('@/assets/images/travel2.jpg')
          },
          {
            relId: 2,
            productId: 102,
            packageName: '故宫+天安门联票',
            packagePrice: 399,
            packageImage: require('@/assets/images/travel3.jpg'),
            mainImgUrl: require('@/assets/images/travel3.jpg')
          }
        ],
        '2': [
          {
            relId: 3,
            productId: 201,
            packageName: '西湖一日游',
            packagePrice: 199,
            packageImage: require('@/assets/images/travel5.jpg'),
            mainImgUrl: require('@/assets/images/travel5.jpg')
          }
        ],
        '3': [
          {
            relId: 4,
            productId: 301,
            packageName: '成都美食文化游',
            packagePrice: 259,
            packageImage: require('@/assets/images/travel.jpg'),
            mainImgUrl: require('@/assets/images/travel.jpg')
          },
          {
            relId: 5,
            productId: 302,
            packageName: '宽窄巷子深度游',
            packagePrice: 189,
            packageImage: require('@/assets/images/travel2.jpg'),
            mainImgUrl: require('@/assets/images/travel2.jpg')
          }
        ]
      };
      
      this.article = mockArticles[articleId] || null;
      this.packages = mockPackages[articleId] || [];
      
      if (!this.article) {
        this.$message.error('文章不存在');
      }
    },
  },
};
</script>

<style scoped>
.scenic-article-detail { padding: 16px; }
.breadcrumb { margin-bottom: 12px; }

.article-card { margin-bottom: 12px; }
.article-header .title { font-size: 22px; font-weight: 700; color: #1f2d3d; }
.article-header .meta { margin-top: 8px; display: flex; align-items: center; gap: 6px; color: #909399; font-size: 12px; }
.article-header .meta .dot { width: 4px; height: 4px; background: #dcdfe6; border-radius: 50%; display: inline-block; }
.cover { margin-top: 12px; border-radius: 8px; overflow: hidden; }
.cover img { width: 100%; display: block; }
.content { padding: 12px 0; color: #303133; line-height: 1.8; }

.packages-card { margin-top: 12px; }
.section-title { font-weight: 600; color: #303133; margin-bottom: 8px; }
.pkg-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; }
.pkg-card { border: 1px solid #f0f0f0; }
.pkg { display: flex; gap: 8px; }
.pkg-image { width: 96px; height: 72px; border-radius: 4px; object-fit: cover; }
.pkg-info { flex: 1; display: flex; flex-direction: column; }
.pkg-name { font-size: 14px; color: #1f2d3d; }
.pkg-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.price { color: #f56c6c; font-weight: 600; }
</style>
