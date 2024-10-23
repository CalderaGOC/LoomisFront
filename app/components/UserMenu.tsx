"use client";

import React from 'react';
import { Menu, MenuButton, MenuList, MenuItem, Button } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon } from '@chakra-ui/icons';

// Define las props que acepta el componente
interface UserMenuProps {
  username: string;  // Recibirá el username como una prop
}

const UserMenu: React.FC<UserMenuProps> = ({ username }) => {
  const router = useRouter();

  const handleLogout = () => {
    console.log("Iniciando logout...");

    // Elimina el token y el nombre de usuario de localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    console.log("Eliminados token y username de localStorage.");
    
    // Redirige al usuario a la página de login
    router.push('/');
    console.log("Redirigiendo a /login...");
  };

  return (
    <Menu>
      <MenuButton as={Button} rightIcon={<ChevronDownIcon />} minWidth="150px">
        {username}
      </MenuButton>
      <MenuList zIndex="1000" minWidth="150px" width="auto">
        <MenuItem onClick={() => router.push('/perfil')}>Ver Perfil</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
};

export default UserMenu;
