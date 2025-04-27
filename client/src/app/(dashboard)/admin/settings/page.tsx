"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Save, Upload, RefreshCw } from "lucide-react";

const AdminSettings = () => {
  // General settings
  const [siteName, setSiteName] = useState("Learning Platform");
  const [siteDescription, setSiteDescription] = useState(
    "A comprehensive online learning platform for students of all levels"
  );
  const [supportEmail, setSupportEmail] = useState("support@learningplatform.com");
  const [logoUrl, setLogoUrl] = useState("/images/logo.png");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  
  // User settings
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [requireEmailVerification, setRequireEmailVerification] = useState(true);
  const [defaultUserRole, setDefaultUserRole] = useState("student");
  const [allowSocialLogin, setAllowSocialLogin] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState("60");
  
  // Content settings
  const [requireCourseApproval, setRequireCourseApproval] = useState(true);
  const [requireBlogApproval, setRequireBlogApproval] = useState(true);
  const [maxUploadSize, setMaxUploadSize] = useState("100");
  const [allowedFileTypes, setAllowedFileTypes] = useState(
    "pdf,doc,docx,jpg,jpeg,png,mp4,mp3"
  );
  
  // Payment settings
  const [currency, setCurrency] = useState("USD");
  const [vatPercentage, setVatPercentage] = useState("20");
  const [platformFeePercentage, setPlatformFeePercentage] = useState("10");
  const [minimumPayout, setMinimumPayout] = useState("50");
  const [payoutSchedule, setPayoutSchedule] = useState("monthly");
  
  // Notifications settings
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [sendCourseCompletionEmail, setSendCourseCompletionEmail] = useState(true);
  const [sendPaymentEmail, setSendPaymentEmail] = useState(true);
  const [sendNewsletterEmail, setSendNewsletterEmail] = useState(true);
  
  // Cache settings
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheTTL, setCacheTTL] = useState("3600");
  
  // Handle form submission
  const handleSaveSettings = (section) => {
    // In a real app, this would send the settings to the backend
    toast({
      title: "Settings saved",
      description: `${section} settings have been updated successfully.`,
    });
  };
  
  // Handle logo upload
  const handleLogoUpload = () => {
    // Simulate logo upload
    toast({
      title: "Logo uploaded",
      description: "Your logo has been uploaded successfully.",
    });
  };
  
  // Handle cache clearing
  const handleClearCache = () => {
    // Simulate cache clearing
    toast({
      title: "Cache cleared",
      description: "The system cache has been cleared successfully.",
    });
  };
  
  return (
    <div className="space-y-6">
      <Header 
        title="Platform Settings" 
        subtitle="Configure global platform settings"
      />
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-customgreys-secondarybg mb-6">
          <TabsTrigger 
            value="general" 
            className="data-[state=active]:bg-primary-700"
          >
            General
          </TabsTrigger>
          <TabsTrigger 
            value="users" 
            className="data-[state=active]:bg-primary-700"
          >
            Users
          </TabsTrigger>
          <TabsTrigger 
            value="content" 
            className="data-[state=active]:bg-primary-700"
          >
            Content
          </TabsTrigger>
          <TabsTrigger 
            value="payments" 
            className="data-[state=active]:bg-primary-700"
          >
            Payments
          </TabsTrigger>
          <TabsTrigger 
            value="notifications" 
            className="data-[state=active]:bg-primary-700"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger 
            value="system" 
            className="data-[state=active]:bg-primary-700"
          >
            System
          </TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="site-name">Platform Name</Label>
                  <Input
                    id="site-name"
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-description">Platform Description</Label>
                  <Textarea
                    id="site-description"
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    rows={3}
                    className="bg-customgreys-primarybg border-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="support-email">Support Email</Label>
                  <Input
                    id="support-email"
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo-url">Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo-url"
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      className="bg-customgreys-primarybg border-none"
                      disabled
                    />
                    <Button onClick={handleLogoUpload} className="bg-primary-700 hover:bg-primary-600">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Brand Color</Label>
                  <div className="flex gap-4 items-center">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-16 h-10 p-1 bg-customgreys-primarybg border-none"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="bg-customgreys-primarybg border-none"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleSaveSettings("General")}
                  className="mt-6 bg-primary-700 hover:bg-primary-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Users Settings */}
        <TabsContent value="users">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>User Settings</CardTitle>
              <CardDescription>Configure user registration and authentication</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-registration" className="text-base">Allow New Registrations</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Enable or disable new user registrations</p>
                  </div>
                  <Switch
                    id="allow-registration"
                    checked={allowRegistration}
                    onCheckedChange={setAllowRegistration}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-email-verification" className="text-base">Require Email Verification</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Users must verify their email before accessing the platform</p>
                  </div>
                  <Switch
                    id="require-email-verification"
                    checked={requireEmailVerification}
                    onCheckedChange={setRequireEmailVerification}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default-user-role">Default User Role</Label>
                  <Select value={defaultUserRole} onValueChange={setDefaultUserRole}>
                    <SelectTrigger className="bg-customgreys-primarybg border-none">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-primarybg border-gray-700">
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="allow-social-login" className="text-base">Allow Social Login</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Enable authentication via social media accounts</p>
                  </div>
                  <Switch
                    id="allow-social-login"
                    checked={allowSocialLogin}
                    onCheckedChange={setAllowSocialLogin}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                  <Input
                    id="session-timeout"
                    type="number"
                    value={sessionTimeout}
                    onChange={(e) => setSessionTimeout(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                  />
                </div>
                
                <Button 
                  onClick={() => handleSaveSettings("User")}
                  className="mt-6 bg-primary-700 hover:bg-primary-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save User Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Settings */}
        <TabsContent value="content">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
              <CardDescription>Configure course and content settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-course-approval" className="text-base">Require Course Approval</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Courses require admin approval before publishing</p>
                  </div>
                  <Switch
                    id="require-course-approval"
                    checked={requireCourseApproval}
                    onCheckedChange={setRequireCourseApproval}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="require-blog-approval" className="text-base">Require Blog Approval</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Blog posts require admin approval before publishing</p>
                  </div>
                  <Switch
                    id="require-blog-approval"
                    checked={requireBlogApproval}
                    onCheckedChange={setRequireBlogApproval}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-upload-size">Maximum Upload Size (MB)</Label>
                  <Input
                    id="max-upload-size"
                    type="number"
                    value={maxUploadSize}
                    onChange={(e) => setMaxUploadSize(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="allowed-file-types">Allowed File Types</Label>
                  <Textarea
                    id="allowed-file-types"
                    value={allowedFileTypes}
                    onChange={(e) => setAllowedFileTypes(e.target.value)}
                    placeholder="Comma-separated list of file extensions"
                    className="bg-customgreys-primarybg border-none"
                  />
                  <p className="text-xs text-customgreys-dirtyGrey">Enter file extensions separated by commas (e.g. pdf,doc,jpg)</p>
                </div>
                
                <Button 
                  onClick={() => handleSaveSettings("Content")}
                  className="mt-6 bg-primary-700 hover:bg-primary-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Content Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Payments Settings */}
        <TabsContent value="payments">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment and financial settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-customgreys-primarybg border-none">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-primarybg border-gray-700">
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="vat-percentage">VAT/Tax Percentage (%)</Label>
                  <Input
                    id="vat-percentage"
                    type="number"
                    value={vatPercentage}
                    onChange={(e) => setVatPercentage(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="platform-fee">Platform Fee Percentage (%)</Label>
                  <Input
                    id="platform-fee"
                    type="number"
                    value={platformFeePercentage}
                    onChange={(e) => setPlatformFeePercentage(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                  />
                  <p className="text-xs text-customgreys-dirtyGrey">Percentage fee taken from instructor earnings</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minimum-payout">Minimum Payout Amount</Label>
                  <Input
                    id="minimum-payout"
                    type="number"
                    value={minimumPayout}
                    onChange={(e) => setMinimumPayout(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payout-schedule">Payout Schedule</Label>
                  <Select value={payoutSchedule} onValueChange={setPayoutSchedule}>
                    <SelectTrigger className="bg-customgreys-primarybg border-none">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent className="bg-customgreys-primarybg border-gray-700">
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={() => handleSaveSettings("Payment")}
                  className="mt-6 bg-primary-700 hover:bg-primary-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Payment Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure platform notifications and emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="welcome-email" className="text-base">Welcome Email</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Send welcome email to new users</p>
                  </div>
                  <Switch
                    id="welcome-email"
                    checked={sendWelcomeEmail}
                    onCheckedChange={setSendWelcomeEmail}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="course-completion" className="text-base">Course Completion Email</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Send congratulatory email when a user completes a course</p>
                  </div>
                  <Switch
                    id="course-completion"
                    checked={sendCourseCompletionEmail}
                    onCheckedChange={setSendCourseCompletionEmail}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="payment-email" className="text-base">Payment Confirmation</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Send email receipt for payments</p>
                  </div>
                  <Switch
                    id="payment-email"
                    checked={sendPaymentEmail}
                    onCheckedChange={setSendPaymentEmail}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="newsletter-email" className="text-base">Newsletter</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Send periodic newsletter with platform updates</p>
                  </div>
                  <Switch
                    id="newsletter-email"
                    checked={sendNewsletterEmail}
                    onCheckedChange={setSendNewsletterEmail}
                  />
                </div>
                
                <Button 
                  onClick={() => handleSaveSettings("Notification")}
                  className="mt-6 bg-primary-700 hover:bg-primary-600"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* System Settings */}
        <TabsContent value="system">
          <Card className="bg-customgreys-secondarybg border-none shadow-md">
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure technical platform settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cache-enabled" className="text-base">Enable System Cache</Label>
                    <p className="text-sm text-customgreys-dirtyGrey">Improve performance with system caching</p>
                  </div>
                  <Switch
                    id="cache-enabled"
                    checked={cacheEnabled}
                    onCheckedChange={setCacheEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                  <Input
                    id="cache-ttl"
                    type="number"
                    value={cacheTTL}
                    onChange={(e) => setCacheTTL(e.target.value)}
                    className="bg-customgreys-primarybg border-none"
                    disabled={!cacheEnabled}
                  />
                  <p className="text-xs text-customgreys-dirtyGrey">Time-to-live for cached items</p>
                </div>
                
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => handleSaveSettings("System")}
                    className="bg-primary-700 hover:bg-primary-600"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save System Settings
                  </Button>
                  
                  <Button 
                    onClick={handleClearCache}
                    variant="outline"
                    className="border-gray-700 hover:bg-customgreys-primarybg"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear System Cache
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings; 