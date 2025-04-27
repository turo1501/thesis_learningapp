"use client";

import Header from "@/components/Header";
import RequestRoleChange from "@/components/RequestRoleChange";
import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import React from "react";

const UserProfilePage = () => {
  return (
    <>
      <Header title="Profile" subtitle="View and update your profile information" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserProfile
            path="/user/profile"
            routing="path"
            appearance={{
              baseTheme: dark,
              elements: {
                scrollBox: "bg-customgreys-darkGrey",
                navbar: {
                  "& > div:nth-child(1)": {
                    background: "none",
                  },
                },
              },
            }}
          />
        </div>
        
        <div className="lg:col-span-1">
          <RequestRoleChange />
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;