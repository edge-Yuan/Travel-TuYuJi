<template>
  <div class="scenic-recommend">
    <el-card class="page-header" shadow="never">
      <div class="header-left">
        <div class="title">景点推荐</div>
        <div class="subtitle">精选服务商文章 · 关联套餐可直接下单</div>
      </div>
      <div class="header-actions">
        <el-input v-model="search.keyword" placeholder="搜索景点/文章/服务商" clearable size="small" class="search-input" @keyup.enter.native="fetchArticles" />
        <el-select v-model="search.region" placeholder="选择地区" clearable size="small" class="filter-item" @change="fetchArticles">
          <el-option v-for="r in regions" :key="r" :label="r" :value="r" />
        </el-select>
        <el-select v-model="search.sortBy" placeholder="排序" size="small" class="filter-item" @change="fetchArticles">
          <el-option label="综合排序" value="comprehensive" />
          <el-option label="热度优先" value="popularity" />
          <el-option label="最新发布" value="latest" />
        </el-select>
        <el-button type="primary" size="small" @click="fetchArticles">搜索</el-button>
      </div>
    </el-card>

    <div class="content">
      <el-row :gutter="16">
        <el-col :span="18">
          <!-- 文章列表 -->
          <el-skeleton v-if="loading" animated :rows="6" style="padding: 12px" />
          <div v-else>
            <el-empty v-if="articles.length === 0" description="暂无推荐，试试调整筛选条件" />
            <el-card v-for="article in articles" :key="article.articleId" class="article-card" shadow="hover">
              <div class="article">
                <div class="left">
                  <div class="cover">
                    <img :src="article.cover" alt="cover" />
                  </div>
                  <div class="body">
                  <div class="meta-row">
                    <div class="tags">
                      <el-tag size="mini" type="success" v-if="article.featured">精选</el-tag>
                      <el-tag size="mini">{{ article.region }}</el-tag>
                    </div>
                    <div class="info">{{ article.merchantName }} · {{ formatTime(article.publishTime) }}</div>
                  </div>
                  <div class="title" @click="openArticle(article)">{{ article.title }}</div>
                  <div class="excerpt">{{ article.excerpt }}</div>
                  </div>
                </div>
                <!-- 右侧关联套餐 -->
                <div class="right-packages">
                  <div class="packages">
                    <div class="pkg-title">相关套餐</div>
                    <div class="pkg-list">
                      <el-card v-for="pkg in article.packages" :key="pkg.relId" class="pkg-card" shadow="never">
                        <div class="pkg">
                          <img :src="pkg.packageImage || pkg.mainImgUrl" class="pkg-image" />
                          <div class="pkg-info">
                            <div class="pkg-name" :title="pkg.packageName">{{ pkg.packageName }}</div>
                            <div class="pkg-meta">
                              <span class="price">¥{{ pkg.packagePrice || pkg.price }}</span>
                              <el-button type="primary" size="mini" @click="goPackage(pkg)">查看套餐</el-button>
                            </div>
                          </div>
                        </div>
                      </el-card>
                    </div>
                  </div>
                </div>
              </div>
            </el-card>

            <div class="pager">
              <el-pagination
                background
                layout="prev, pager, next"
                :page-size="page.pageSize"
                :current-page.sync="page.current"
                :total="page.total"
                @current-change="fetchArticles"
              />
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <!-- 侧栏：热门目的地/作者 -->
          <el-card class="side-card" shadow="never">
            <div class="side-title">热门目的地</div>
            <div class="chips">
              <el-check-tag v-for="d in hotDestinations" :key="d.destId" :checked="search.keyword===d.destinationName" @change="() => quickFilter(d.destinationName)">{{ d.destinationName }}</el-check-tag>
            </div>
          </el-card>

          <el-card class="side-card" shadow="never" style="margin-top: 12px">
            <div class="side-title">优选服务商</div>
            <div class="merchant-list">
              <div class="merchant" v-for="m in merchants" :key="m.merchantId">
                <el-avatar :size="28" :src="m.avatar" />
                <span class="name">{{ m.merchantName }}</span>
                <el-tag size="mini" style="margin-left:auto">{{ m.articleCount }} 篇</el-tag>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'scenicRecommend',
  data() {
    return {
      loading: false,
      search: {
        keyword: '',
        region: '',
        sortBy: 'comprehensive',
      },
      regions: [],
      page: { current: 1, pageSize: 6, total: 0 },
      articles: [],
      hotDestinations: [],
      merchants: [],
    };
  },
  created() {
    this.fetchRegions();
    this.fetchHotDestinations();
    this.fetchHotMerchants();
    this.fetchArticles();
  },
  methods: {
    async fetchRegions() {
      try {
        const response = await request.get('/travel-portal/scenic-recommend/regions');
        this.regions = response.data;
      } catch (error) {
        console.error('获取地区列表失败:', error);
        // 使用模拟数据作为后备
        this.regions = ['华北', '华东', '华南', '西南', '西北', '东北'];
      }
    },
    async fetchHotDestinations() {
      try {
        const response = await request.get('/travel-portal/scenic-recommend/hot-destinations?limit=6');
        this.hotDestinations = response.data;
      } catch (error) {
        console.error('获取热门目的地失败:', error);
        // 使用模拟数据作为后备
        this.hotDestinations = [
          { destId: 1, destinationName: '北京' },
          { destId: 2, destinationName: '上海' },
          { destId: 3, destinationName: '杭州' },
          { destId: 4, destinationName: '成都' },
          { destId: 5, destinationName: '西安' },
          { destId: 6, destinationName: '三亚' }
        ];
      }
    },
    async fetchHotMerchants() {
      try {
        const response = await request.get('/travel-portal/scenic-recommend/hot-merchants?limit=3');
        this.merchants = response.data.map(merchant => ({
          ...merchant,
          avatar: `https://picsum.photos/id/${merchant.merchantId}/80/80`
        }));
      } catch (error) {
        console.error('获取热门服务商失败:', error);
        // 使用模拟数据作为后备
        this.merchants = [
          { merchantId: 1, merchantName: '北京旅行社', articleCount: 15 },
          { merchantId: 2, merchantName: '上海旅游集团', articleCount: 12 },
          { merchantId: 3, merchantName: '杭州文旅公司', articleCount: 8 }
        ];
      }
    },
    async fetchArticles() {
      this.loading = true;
      try {
        const params = {
          current: this.page.current,
          size: this.page.pageSize,
          keyword: this.search.keyword,
          region: this.search.region,
          sortBy: this.search.sortBy
        };
        
        const response = await request.get('/travel-portal/scenic-recommend/articles', { params });
        const data = response.data;
        
        this.articles = data.articles || [];
        this.page.total = data.total || 0;
        
        // 为每个文章获取关联套餐
        for (let article of this.articles) {
          try {
            const packagesResponse = await request.get(`/travel-portal/scenic-recommend/articles/${article.articleId}`);
            article.packages = packagesResponse.data.packages || [];
          } catch (error) {
            console.error(`获取文章${article.articleId}的套餐失败:`, error);
            article.packages = [];
          }
        }
      } catch (error) {
        console.error('获取文章列表失败:', error);
        // 使用模拟数据作为后备
        this.loadMockArticles();
      } finally {
        this.loading = false;
      }
    },
    openArticle(article) {
      this.$router.push({ name: 'scenicArticleDetail', params: { id: String(article.articleId) } });
    },
    goPackage(pkg) {
      this.$router.push({ path: '/traveller/packageDetail', query: { id: pkg.productId } });
    },
    formatTime(iso) {
      const d = new Date(iso);
      return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
    },
    quickFilter(keyword) {
      this.search.keyword = keyword;
      this.fetchArticles();
    },
    
    // 加载模拟文章数据
    loadMockArticles() {
      const mockArticles = [
        {
          articleId: 1,
          title: '北京故宫深度游：探寻紫禁城的千年历史',
          excerpt: '故宫，这座承载着明清两代帝王梦想的宫殿，每一砖一瓦都诉说着历史的沧桑。跟随我们的脚步，一起探寻这座世界文化遗产的奥秘...',
          cover: require('@/assets/images/travel.jpg'),
          region: '华北',
          merchantName: '北京旅行社',
          publishTime: '2024-01-15T10:30:00Z',
          featured: true,
          packages: [
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
          ]
        },
        {
          articleId: 2,
          title: '杭州西湖：人间天堂的诗意之旅',
          excerpt: '西湖，这个被无数文人墨客赞颂的地方，以其秀美的山水和深厚的文化底蕴，成为了杭州最亮丽的名片。让我们一同感受这份诗意...',
          cover: require('@/assets/images/travel4.jpg'),
          region: '华东',
          merchantName: '杭州文旅公司',
          publishTime: '2024-01-12T14:20:00Z',
          featured: false,
          packages: [
            {
              relId: 3,
              productId: 201,
              packageName: '西湖一日游',
              packagePrice: 199,
              packageImage: require('@/assets/images/travel5.jpg'),
              mainImgUrl: require('@/assets/images/travel5.jpg')
            }
          ]
        },
        {
          articleId: 3,
          title: '成都宽窄巷子：品味巴蜀文化的慢生活',
          excerpt: '宽窄巷子，成都最具代表性的历史文化街区，这里不仅有传统的川西民居，更有地道的成都美食和悠闲的生活节奏...',
          cover: require('@/assets/images/travel6.jpg'),
          region: '西南',
          merchantName: '成都旅游集团',
          publishTime: '2024-01-10T09:15:00Z',
          featured: true,
          packages: [
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
        }
      ];
      
      // 根据搜索条件过滤数据
      let filteredArticles = mockArticles;
      
      if (this.search.keyword) {
        filteredArticles = filteredArticles.filter(article => 
          article.title.includes(this.search.keyword) || 
          article.excerpt.includes(this.search.keyword) ||
          article.merchantName.includes(this.search.keyword)
        );
      }
      
      if (this.search.region) {
        filteredArticles = filteredArticles.filter(article => 
          article.region === this.search.region
        );
      }
      
      // 根据排序方式排序
      if (this.search.sortBy === 'popularity') {
        filteredArticles.sort((a, b) => b.featured - a.featured);
      } else if (this.search.sortBy === 'latest') {
        filteredArticles.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
      }
      
      this.articles = filteredArticles;
      this.page.total = filteredArticles.length;
    },
  },
};
</script>

<style scoped>
.scenic-recommend { padding: 16px; }

.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding: 16px; }
.header-left .title { font-size: 18px; font-weight: 600; color: #1f2d3d; margin-bottom: 6px; }
.header-left .subtitle { color: #909399; font-size: 13px; margin-top: 0; }
.header-actions { display: flex; align-items: center; gap: 16px; padding-top: 6px; }
.search-input { width: 280px; }
.filter-item { width: 160px; }

.article-card { margin-bottom: 16px; padding: 12px; }
.article { display: grid; grid-template-columns: 1fr 360px; gap: 20px; align-items: start; }
.left { display: grid; grid-template-rows: auto 1fr; gap: 12px; }
.cover { width: 100%; height: 220px; overflow: hidden; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }
.cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.body { display: flex; flex-direction: column; }
.meta-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.meta-row .tags { display: flex; align-items: center; gap: 6px; }
.meta-row .info { color: #909399; font-size: 12px; }
.title { font-size: 18px; font-weight: 700; color: #1f2d3d; cursor: pointer; line-height: 1.5; margin-bottom: 8px; }
.title:hover { color: #3a7afe; }
.excerpt { color: #606266; font-size: 13px; margin: 0 0 6px; line-height: 1.7; }

.packages { background: #f7f9fc; border: 1px solid #eef2f6; border-radius: 6px; padding: 10px 12px; }
.pkg-title { font-size: 13px; color: #909399; margin-bottom: 8px; }
.pkg-list { display: grid; grid-template-columns: 1fr; gap: 12px; }
.right-packages { display: flex; align-items: center; justify-content: center; align-self: stretch; }
.right-packages .packages { width: 100%; max-width: 320px; }
.pkg-card { border: 1px solid #f0f0f0; }
.pkg { display: flex; gap: 8px; }
.pkg-image { width: 84px; height: 64px; border-radius: 4px; object-fit: cover; }
.pkg-info { flex: 1; display: flex; flex-direction: column; min-width: 0; }
.pkg-name { font-size: 13px; color: #303133; white-space: normal; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.pkg-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 6px; }
.price { color: #f56c6c; font-weight: 600; }

.side-card { margin-bottom: 12px; }
.side-title { font-weight: 600; color: #303133; margin-bottom: 10px; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; }
.merchant-list { display: flex; flex-direction: column; gap: 10px; }
.merchant { display: flex; align-items: center; gap: 8px; }
.merchant .name { color: #606266; }

.pager { margin-top: 12px; text-align: center; }

/* 响应式：窄屏下回退为上下布局 */
@media (max-width: 1024px) {
  .article { grid-template-columns: 1fr; }
  .cover { width: 100%; height: 200px; }
  .right-packages { margin-top: 10px; }
}
</style>
