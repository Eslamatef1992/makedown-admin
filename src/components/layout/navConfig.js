// Mirrors the module list from the Figma admin dashboard sidebar, verbatim.
// labelKey resolves against src/i18n/locales/{en,ar}.json under the "nav" namespace.
export const NAV_SECTIONS = [
  { labelKey: 'nav.dashboard', to: '/' },
  { labelKey: 'nav.admins', to: '/admins' },
  { labelKey: 'nav.roles', to: '/roles' },
  {
    labelKey: 'nav.userManagement',
    children: [
      { labelKey: 'nav.users', to: '/users' },
      { labelKey: 'nav.specialUsers', to: '/users/special' },
    ],
  },
  {
    labelKey: 'nav.education',
    children: [
      { labelKey: 'nav.schools', to: '/schools' },
      { labelKey: 'nav.games', to: '/quizzes' },
    ],
  },
  { labelKey: 'nav.categories', to: '/game-categories' },
  { labelKey: 'nav.gamesHistory', to: '/game-sessions' },
  { labelKey: 'nav.chatting', to: '/chat' },
  {
    labelKey: 'nav.ecommerce',
    children: [
      { labelKey: 'nav.products', to: '/products' },
      { labelKey: 'nav.variantTypes', to: '/variant-types' },
      { labelKey: 'nav.coupons', to: '/coupons' },
      { labelKey: 'nav.deliveryFee', to: '/cms/delivery-fee' },
      { labelKey: 'nav.orders', to: '/orders' },
      { labelKey: 'nav.ordersGuest', to: '/orders/guest' },
    ],
  },
  { labelKey: 'nav.packages', to: '/packages' },
  { labelKey: 'nav.getInTouch', to: '/contact-messages' },
  {
    labelKey: 'nav.cms',
    children: [
      { labelKey: 'nav.aboutUs', to: '/cms/pages/about-us' },
      { labelKey: 'nav.privacyPolicy', to: '/cms/pages/privacy-policy' },
      { labelKey: 'nav.termsAndConditions', to: '/cms/pages/terms-and-conditions' },
      { labelKey: 'nav.returnPolicy', to: '/cms/pages/return-policy' },
      { labelKey: 'nav.faq', to: '/cms/faqs' },
      { labelKey: 'nav.contactUs', to: '/contact-messages' },
      { labelKey: 'nav.socialMedia', to: '/cms/social-links' },
      { labelKey: 'nav.howItWorks', to: '/cms/pages/how-it-works' },
      { labelKey: 'nav.homeVideo', to: '/cms/home-video' },
      { labelKey: 'nav.contactInfo', to: '/cms/contact-info' },
    ],
  },
];
