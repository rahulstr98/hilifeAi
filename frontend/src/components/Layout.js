import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState, useContext } from "react";
import Header from "./Header";
import { FormControlLabel, Box, Button } from "@mui/material";
import { alpha, styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { UserRoleAccessContext } from "../context/Appcontext";
import KeyboardArrowUpTwoToneIcon from '@mui/icons-material/KeyboardArrowUpTwoTone';
import ScreenShot from "./Screenshot";

const NavbarSwitch = styled((props) => (
  <Switch
    focusVisibleClassName=".Mui-focusVisible"
    disableRipple
    {...props}
    onClick={props.onClick}
  />
))(({ theme, buttonStyles }) => ({
  padding: 8,
  '& .MuiSwitch-track': {
    borderRadius: 22 / 2,
    backgroundColor: buttonStyles?.navbar?.backgroundColor,
    '&::before, &::after': {
      content: '""',
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      width: 16,
      height: 16,
    },
    '&::before': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
      left: 12,
    },
    '&::after': {
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
        theme.palette.getContrastText(theme.palette.primary.main)
      )}" d="M19,13H5V11H19V13Z" /></svg>')`,
      right: 12,
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: 16,
    height: 16,
    margin: 2,
    backgroundColor: buttonStyles?.navbar?.backgroundColor,
  },
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: buttonStyles?.navbar?.color,
    '&:hover': {
      backgroundColor: alpha(buttonStyles?.navbar?.backgroundColor, theme.palette.action.hoverOpacity),
    },
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: buttonStyles?.navbar?.backgroundColor,
  },
}));

const Layout = () => {

  const { isUserRoleCompare, buttonStyles } = useContext(UserRoleAccessContext);
  const location = useLocation();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(64);

  // const contentStyle = location.pathname === "/dashboard" || location.pathname === "/"
  // ? {
  //   maxWidth: "100%",
  //   margin: "0 auto",
  //   padding: "2px 0px"
  // } // Override styles for specific page
  // : {
  //   maxWidth: "1600px",
  //   margin: "0 auto",
  //   padding: "3px 20px"
  // }

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight); // Get the header height
    }

    // Update the height on window resize to ensure responsiveness
    const handleResize = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [showNavbar, setShowNavbar] = useState(true);

  // Handle navbar hide/show
  const toggleNavbar = () => {
    setShowNavbar((prev) => !prev);
  };

  const [showScroll, setShowScroll] = useState(false);
  // Scroll-to-top functionality
  const handleScroll = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Show Scroll-to-top button when scrolled down
  useEffect(() => {
    const checkScrollTop = () => {
      if (window.pageYOffset > 300) {
        setShowScroll(true);
      } else {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, []);

  return (
    <div>
      {showNavbar && (
        <div ref={headerRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 1500,
            opacity: showNavbar ? 1 : 0,
            transition: 'transform 1s ease, opacity 1s ease, width 1s, height 1s',
          }}
        >
          <Header />
        </div>
      )}
      <Box
        className="content"
        sx={{
          position: 'relative',
          marginTop: {
            lg: showNavbar ? `100px` : '20px',
            md: showNavbar ? `100px` : '20px',
            sm: showNavbar ? `125px` : '20px',
            xs: showNavbar ? `125px` : '20px',
          },
          transition: 'margin-top 1s ease',
        }}
      >
        <Outlet />
      </Box>
      <Box>
        <FormControlLabel sx={{
          position: "fixed",
          top: showNavbar ? 85 : 20,
          right: showNavbar ? 202 : 0,
          zIndex: 1499,
          transition: 'margin-top 1s ease, right 1s ease',
        }}
          control={<NavbarSwitch defaultChecked checked={showNavbar} buttonStyles={buttonStyles} onClick={toggleNavbar} />}
        />
      </Box>
      {isUserRoleCompare?.includes("araiseproblem") && <ScreenShot showScroll={showScroll} />}
      {/* Scroll-to-top button */}
      {
        showScroll && (
          <Button onClick={handleScroll} sx={{
            position: "fixed", bottom: 30, right: 30,
            // zIndex: 2000, 
            color: "black",
            minWidth: '50px',
            height: "3rem",
            width: "3rem",
            fontSize: "5rem",
            borderRadius: "50%",
            cursor: "pointer",
            backgroundColor: 'transparent',
            boxShadow: '0px 3px 8px #aaa, inset 0px 2px 3px #fff',
            '&. hover': {
              backgroundColor: 'transparent',
              boxShadow: '0px 3px 8px #aaa, inset 0px 2px 3px #fff',
            }
          }}>
            <KeyboardArrowUpTwoToneIcon style={{ fontSize: '30px' }} />
          </Button >
        )
      }
    </div >
  );
};

export default Layout;
