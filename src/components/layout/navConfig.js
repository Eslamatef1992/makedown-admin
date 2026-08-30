// Mirrors the module list from the Figma admin dashboard sidebar, verbatim.
export const NAV_SECTIONS = [
  { label: 'Dashboard', to: '/' },
  { label: 'Admins', to: '/admins' },
  { label: 'Roles', to: '/roles' },
  {
    label: 'User management',
    children: [
      { label: 'Users', to: '/users' },
      { label: 'Special users', to: '/users/special' },
    ],
  },
  {
    label: 'Education',
    children: [
      { label: 'Schools', to: '/schools' },
      { label: 'Games', to: '/quizzes' },
    ],
  },
  { label: 'Categories', to: '/game-categories' },
  { label: 'Games history', to: '/game-sessions' },
  { label: 'Orders', to: '/orders' },
  { label: 'Orders as a guest', to: '/orders/guest' },
  { label: 'Chatting', to: '/chat' },
  {
    label: 'Ecommerce',
    children: [
      { label: 'Products', to: '/products' },
      { label: 'Categories', to: '/product-categories' },
    ],
  },
  { label: 'Packages', to: '/packages' },
  { label: 'Get in touch', to: '/contact-messages' },
  {
    label: 'CMS',
    children: [
      { label: 'About us', to: '/cms/pages/about-us' },
      { label: 'Privacy policy', to: '/cms/pages/privacy-policy' },
      { label: 'Terms and conditions', to: '/cms/pages/terms-and-conditions' },
      { label: 'Return policy', to: '/cms/pages/return-policy' },
      { label: 'FAQ', to: '/cms/faqs' },
      { label: 'Contact us', to: '/contact-messages' },
      { label: 'Social media', to: '/cms/social-links' },
      { label: 'How it works', to: '/cms/pages/how-it-works' },
    ],
  },
];
