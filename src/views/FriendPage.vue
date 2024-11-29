<template>
  <el-row>
    <!-- 左侧：好友列表 -->
    <el-col :span="6">
      <friend-list />
    </el-col>

    <el-col :span="12">
      <router-view :key="$route.params.friendId" />
    </el-col>
    <!-- 中间：搜索框 -->
    <el-col :span="6">
      <search-user />
    </el-col>

    <!-- 右侧：聊天框 -->
   
  </el-row>
</template>

<script setup>
import FriendList from '../components/FriendList.vue';

import SearchUser from '../components/SearchUser.vue';
</script>
