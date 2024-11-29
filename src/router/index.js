import { createRouter, createWebHistory } from 'vue-router';
import BooksPage from '../views/BooksPage.vue';
import CartPage from '../views/CartPage.vue';
import OrdersPage from '../views/ordersPage.vue';
import AddressPage from '../views/AddressPage.vue';
import BookDetail from '../views/BookDetail.vue';
import OrderDetail from '../views/OrderDetail.vue';
import CheckoutPage from '../views/CheckoutPage.vue';
import LoginLayout from '../components/LoginLayout.vue';
import MainLayout from '../components/MainLayout.vue';
import Login from '../views/Login.vue';
import FriendPage from '../views/FriendPage.vue';
import UserProfile from '../views/UserProfile.vue';
import ChatPage from '../components/Chat.vue';
import MessagePage from '../views/MessagePage.vue';
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs';
import EmailRegister from '../views/EmailRegister.vue';
import RegisterDetails from '../views/RegisterDetails.vue';
import PayPage from '../views/PayPage.vue';
import MyBookPage from '../views/MyBookPage.vue';
import MyBookDetail from '../views/MyBookDetail.vue';
import OrderMessagesPage from '../views/OrderMessagesPage.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: Login
      },
      { 
        
        path: 'register',
        name: 'Register',
        component: EmailRegister,
      },
      {
        path: 'register/details/:email',
        name: 'RegisterDetails',
        component: RegisterDetails,
        props: true, // 启用 props 传递
      }
    ]
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'books', name: 'Books', component: BooksPage },
      { path: 'cart', name: 'Cart', component: CartPage },
      {path: 'pay' , name: 'Pay' , component: PayPage  },
      { path: 'orders/:status?', name: 'Order', component: OrdersPage },
      { path: 'address', name: 'Address', component: AddressPage },
      { path: 'book-detail/:bookId', name: 'BookDetail', component: BookDetail },
      { path: 'order-detail/:orderId', name: 'OrderDetails', component: OrderDetail },
      { path: 'checkout', name: 'CheckoutPage', component: CheckoutPage },
       {path: 'orderMessage',name: 'orderMessage',component: OrderMessagesPage},
       { path: 'mybook', name: 'MyBookPage', component: MyBookPage,
      
        children: [
          {
            path: ':id',  // Nested route for the chat page
            name: 'MyBookDetail',
            component: MyBookDetail,
            props: true // 启用 props 传递参数
          }
        ] 
        },
       {path: 'messages',name: 'MessagePage',component: MessagePage},
      { 
        path: 'friends', 
        name: 'Friends',
        component: FriendPage,
        children: [
          {
            path: 'chat/:friendId',  // Nested route for the chat page
            name: 'Chat',
            component: ChatPage
          }
        ] 
      },
      { path: 'user/profile', name: 'UserProfile', component: UserProfile },
      {
        path: '',
        redirect: '/books' // Default redirection
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Add global navigation guards to check login status and token
router.beforeEach((to, from, next) => {
  console.log('Navigating to route:', to);  
  const token = sessionStorage.getItem('token');
  
  // If navigating to 'Books' or 'Friends', no authentication required
  if (to.name === 'Books' || to.name === 'Register' || to.name === 'RegisterDetails' ) {
    return next(); // No auth required, proceed
  }

   //If target route requires authentication and no token is present, redirect to login page
  if (to.name !== 'Login' && !token) {

    alert('请先去登录');
    return next({ name: 'Login' }); // Redirect to login page
  }
  next(); // Continue navigation
});

export default router;
