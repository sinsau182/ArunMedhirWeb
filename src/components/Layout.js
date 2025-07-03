import PasswordChangeAlert from './PasswordChangeAlert';

const Layout = ({ children }) => {
  return (
    <>
      <PasswordChangeAlert />
      {children}
    </>
  );
};

export default Layout; 