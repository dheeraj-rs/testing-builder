export const MENU_ITEMS = [
  {
    label: 'Home',
    items: [{ label: 'Dashboard', icon: 'pi pi-fw pi-home', to: '/' }],
  },
  {
    label: 'Builder',
    items: [
      {
        label: 'Website Builder',
        icon: 'pi pi-fw pi-desktop',
        to: '/website-builder',
      },
      {
        label: 'Drag Drop Builder',
        icon: 'pi pi-fw pi-objects-column',
        to: '/drag-drop-builder',
      },
    ],
  },
  {
    label: 'UI Components',
    items: [
      {
        label: 'Elements',
        icon: 'pi pi-fw pi-th-large',
        items: [
          {
            label: 'Buttons',
            icon: 'pi pi-fw pi-box',
            to: '/uikit/button',
            items: [
              {
                label: 'Buttons2',
                icon: 'pi pi-fw pi-circle-on',
                to: '/uikit/button',
              },
              {
                label: 'Forms2',
                icon: 'pi pi-fw pi-list-check',
                to: '/uikit/form',
              },
            ],
          },
          {
            label: 'Forms',
            icon: 'pi pi-fw pi-list',
            to: '/uikit/form',
          },
        ],
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        label: 'Profile',
        icon: 'pi pi-fw pi-user',
        to: '/profile',
      },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        to: '/settings',
      },
    ],
  },
];
