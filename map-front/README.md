
# Aplicação de gerenciamento de mapas com Leaflet

## Estrutura de pasta

src/
├── assets/
│   ├── images/
│   │   ├── marker-icon.png
│   │   ├── toggle.png
│   │   └── toggle.svg
│   └── styles/
│       ├── index.css
│       └── App.css
├── components/
│   ├── common/
│   │   ├── AdminRoute/
│   │   │   ├── AdminRoute.css
│   │   │   └── AdminRoute.jsx
│   │   └── TesteModal/
│   │       ├── TesteModal.css
│   │       └── TesteModal.jsx
│   ├── layout/
│   │   ├── Header/
│   │   │   ├── Header.css
│   │   │   └── Header.jsx
│   │   └── HeaderWithMenu/
│   │       ├── HeaderWithMenu.css
│   │       └── HeaderWithMenu.jsx
│   ├── map/
│   │   ├── Control.MiniMap.css
│   │   ├── GenericMapView/
│   │   │   ├── GenericMapView.css
│   │   │   └── GenericMapView.jsx
│   │   ├── MapView/
│   │   │   ├── MapView.css
│   │   │   └── MapView.jsx
│   │   └── MapaViewbck.jsx
│   └── users/
│       ├── LoginForm/
│       │   ├── LoginForm.css
│       │   └── LoginForm.jsx
│       └── RegisterForm/
│           ├── RegisterForm.css
│           └── RegisterForm.jsx
├── context/
│   ├── MapContext.jsx
│   └── UserContext.jsx
├── features/
│   ├── dashboard/
│   │   ├── Dashboard.css
│   │   └── Dashboard.jsx
│   ├── manage-points-areas/
│   │   ├── ManagePointsAreas.css
│   │   └── ManagePointsAreas.jsx
│   └── manage-users/
│       ├── ManageUsers.css
│       ├── ManageUsers.jsx
│       └── UsersPage.jsx
├── services/
│   └── api.js
├── utils/
│   └── tokenUtils.jsx
├── views/
│   └── UsersPage/
│       ├── Userspage.css
│       └── UsersPage.jsx
├── App.jsx
├── App.test.js
├── index.js
├── logo.svg
└── setupTests.js


assets/: Todos os recursos estáticos foram movidos para cá, incluindo imagens e estilos globais.
components/: Organizei os componentes em subcategorias:
common/: Para componentes reutilizáveis como AdminRoute e TesteModal.
layout/: Para componentes de layout como Header e HeaderWithMenu.
map/: Para componentes relacionados a mapas.
users/: Para componentes relacionados a usuários, como LoginForm e RegisterForm.
features/: Criei esta pasta para funcionalidades mais complexas:
dashboard/: Contém o componente Dashboard.
manage-points-areas/: Contém o componente ManagePointsAreas.
manage-users/: Contém ManageUsers e UsersPage.
services/: Mantive o api.js aqui, mas você pode considerar dividi-lo em serviços mais específicos no futuro.
utils/: Mantive o tokenUtils.jsx aqui.
views/: Criei esta pasta para componentes que representam páginas inteiras. Por enquanto, só movi o UsersPage para cá.
Arquivos na raiz do src/:
Mantive App.jsx, App.test.js, index.js, logo.svg e setupTests.js na raiz do src/, pois são arquivos principais do projeto.