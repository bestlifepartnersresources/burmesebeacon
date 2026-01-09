'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Notification from '@/components/Notification'
import { AdminFormData, DataState } from '@/lib/types'

export default function Admin() {
  const [passcode, setPasscode] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [formData, setFormData] = useState<AdminFormData>({
    overview_content: {},
    overview_ads: {},
    home_card: {},
    home_ads: {}
  })
  const [data, setData] = useState<DataState>({})
  const [uploadFormData, setUploadFormData] = useState({
    title: '',
    description: '',
    category: '' as 'Videos' | 'Musics' | 'Others' | '',
    sub_category: '',
    content_url: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [overviewFile, setOverviewFile] = useState<File | null>(null)
  const [homeFile, setHomeFile] = useState<File | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [appSettings, setAppSettings] = useState({
    hf_token: '',
    hf_repo: ''
  })
  const [settingsForm, setSettingsForm] = useState({
    hf_token: '',
    hf_repo: ''
  })
  const [savedSettings, setSavedSettings] = useState({
    hf_token: '',
    hf_repo: ''
  })
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const overviewFileInputRef = useRef<HTMLInputElement>(null)
  const homeFileInputRef = useRef<HTMLInputElement>(null)
  const sidebarFileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Check for persistent session
    const sessionAuth = sessionStorage.getItem('adminAuthenticated')
    if (sessionAuth === 'true') {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchData()
      fetchAppSettings()
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuthenticated')
    setNotification('Logged out successfully')
  }

  const handleLogin = async () => {
    const { data, error } = await supabase
      .from('admin_settings')
      .select('passcode_hash')
      .single()

    if (error) {
      setError('Error fetching passcode')
      return
    }

    // For simplicity, assuming passcode is stored as plain text; in production, hash it
    if (passcode === data.passcode_hash) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuthenticated', 'true')
      setError('')
    } else {
      setError('Invalid passcode')
    }
  }

  const fetchData = async () => {
    const tables = ['overview_ads', 'overview_content', 'home_ads', 'home_card', 'sidebar_contents']
    const fetchedData: any = {}
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*')
      if (!error) {
        fetchedData[table] = data
      }
    }
    setData(fetchedData)
  }

  const fetchAppSettings = async () => {
    const { data, error } = await supabase.from('app_settings').select('setting_key, setting_value')
    if (!error && data) {
      const settings: any = {}
      data.forEach((item: any) => {
        settings[item.setting_key] = item.setting_value
      })
      setAppSettings(settings)
      setSavedSettings(settings)
    }
  }

  const handleSaveAppSettings = async () => {
    setIsSaving(true)
    setSaveError('')
    setSuccessMessage('')

    try {
      // Upsert hf_token setting
      const { error: tokenError } = await supabase
        .from('app_settings')
        .upsert(
          { setting_key: 'hf_token', setting_value: appSettings.hf_token },
          { onConflict: 'setting_key' }
        )

      if (tokenError) {
        throw new Error('Failed to save HF token')
      }

      // Upsert hf_repo_name setting
      const { error: repoError } = await supabase
        .from('app_settings')
        .upsert(
          { setting_key: 'hf_repo', setting_value: appSettings.hf_repo },
          { onConflict: 'setting_key' }
        )

      if (repoError) {
        throw new Error('Failed to save HF repo name')
      }

      // Refresh settings to show updated values
      await fetchAppSettings()

      setSuccessMessage('Settings saved successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)

      // Reset form fields
      setAppSettings({ hf_token: '', hf_repo: '' })
    } catch (error: any) {
      setSaveError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFormSubmit = async (table: string) => {
    const { error } = await supabase.from(table).insert([formData[table]])
    if (!error) {
      fetchData()
      setFormData({ ...formData, [table]: {} })
    }
  }

  const handleDelete = async (table: string, id: string) => {
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) {
      fetchData()
    }
  }

  const handleUploadSubmit = async () => {
    if (!uploadFormData.content_url) {
      setError('Please provide a Hugging Face URL')
      return
    }

    setIsUploading(true)
    setProgress(0)
    setSuccessMessage('')
    setError('')

    try {
      const response = await fetch('/api/hf-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify({
          title: uploadFormData.title,
          description: uploadFormData.description,
          category: uploadFormData.category,
          content_url: uploadFormData.content_url
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError('Upload failed: ' + result.error)
        setIsUploading(false)
        return
      }

      // If API validation succeeds, insert into Supabase
      const { error } = await supabase.from('sidebar_contents').insert([{
        title: uploadFormData.title,
        description: uploadFormData.description,
        category: uploadFormData.category,
        sub_category: uploadFormData.sub_category,
        content_url: uploadFormData.content_url
      }])

      if (!error) {
        fetchData()
        setUploadFormData({ title: '', description: '', category: '', sub_category: '', content_url: '' })
        setSuccessMessage('တင်ခြင်း အောင်မြင်ပါသည်!')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError('Failed to save content to database')
      }
    } catch (error) {
      setError('Upload failed')
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const renderForm = (table: string) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">Add {table.replace('_', ' ')}</h3>
      {/* Form fields based on table */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {Object.keys(formData[table] || {}).map((key) => (
          <input
            key={key}
            type="text"
            placeholder={key}
            value={formData[table][key] || ''}
            onChange={(e) => setFormData({
              ...formData,
              [table]: { ...formData[table], [key]: e.target.value }
            })}
            className="p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
          />
        ))}
      </div>
      <button
        onClick={() => handleFormSubmit(table)}
        className="bg-[#ffd700] text-[#001f3f] px-4 py-2 rounded hover:bg-[#e6c200] transition-colors"
      >
        Upload
      </button>
    </div>
  )

  const renderTable = (table: string) => (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">{table.replace('_', ' ')} List</h3>
      <table className="w-full bg-white text-black rounded">
        <thead>
          <tr>
            {data[table] && data[table].length > 0 && Object.keys(data[table][0]).map((key) => (
              <th key={key} className="p-2 border">{key}</th>
            ))}
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data[table] && data[table].map((item: any) => (
            <tr key={item.id}>
              {Object.values(item).map((value: any, index) => (
                <td key={index} className="p-2 border">{value}</td>
              ))}
              <td className="p-2 border">
                <button
                  onClick={() => handleDelete(table, item.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-[#001f3f] flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
            <input
              type="password"
              placeholder="Enter passcode"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded mb-4"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-[#001f3f] text-white p-2 rounded hover:bg-[#002f5f]"
            >
              Login
            </button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </div>
        </div>
        {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#001f3f] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <div className="mb-8">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded mr-4 ${activeTab === 'overview' ? 'bg-[#ffd700] text-[#001f3f]' : 'bg-gray-600'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded mr-4 ${activeTab === 'home' ? 'bg-[#ffd700] text-[#001f3f]' : 'bg-gray-600'}`}
        >
          Home Page
        </button>
        <button
          onClick={() => setActiveTab('sidebar')}
          className={`px-4 py-2 rounded mr-4 ${activeTab === 'sidebar' ? 'bg-[#ffd700] text-[#001f3f]' : 'bg-gray-600'}`}
        >
          Sidebar
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded mr-4 ${activeTab === 'settings' ? 'bg-[#ffd700] text-[#001f3f]' : 'bg-gray-600'}`}
        >
          Settings
        </button>
      </div>
      {activeTab === 'overview' && (
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffd700' }}>Content Section</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.overview_content?.title || ''}
              onChange={(e) => setFormData({
                ...formData,
                overview_content: { ...formData.overview_content, title: e.target.value }
              })}
              className="w-full p-2 bg-[#001f3f] border border-[#ffd700] text-[#ffd700] rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.overview_content?.description || ''}
              onChange={(e) => setFormData({
                ...formData,
                overview_content: { ...formData.overview_content, description: e.target.value }
              })}
              className="w-full p-2 bg-[#001f3f] border border-[#ffd700] text-[#ffd700] rounded"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Video File</label>
            <input
              type="file"
              onChange={(e) => setOverviewFile(e.target.files ? e.target.files[0] : null)}
              ref={overviewFileInputRef}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
            />
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500 text-white rounded text-center font-bold">
              {successMessage}
            </div>
          )}
          <div className="mb-4">
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-[#ffd700] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            {isUploading && <p className="text-white text-sm mb-2">Uploading: {progress}%</p>}
          </div>
          <button
            onClick={async () => {
              setIsUploading(true)
              setProgress(0)
              setSuccessMessage('')
              let videoUrl = ''
              if (overviewFile) {
                const fileExt = overviewFile.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const { data, error } = await supabase.storage
                  .from('overview_Videos')
                  .upload(fileName, overviewFile, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (progress: any) => {
                      const percent = (progress.loaded / progress.total) * 100
                      setProgress(Math.round(percent))
                    }
                  } as any)
                if (error) {
                  setError('Upload failed')
                  setIsUploading(false)
                  setProgress(0)
                  return
                }
                const { data: urlData } = supabase.storage.from('overview_Videos').getPublicUrl(fileName)
                videoUrl = urlData.publicUrl
              }
              const { error } = await supabase.from('overview_content').insert([{
                title: formData.overview_content?.title,
                description: formData.overview_content?.description,
                video_url: videoUrl
              }])
              if (!error) {
                fetchData()
                setFormData({ ...formData, overview_content: {} })
                setOverviewFile(null)
                if (overviewFileInputRef.current) {
                  overviewFileInputRef.current.value = ''
                }
                setIsUploading(false)
                setProgress(0)
                setSuccessMessage('တင်ခြင်း အောင်မြင်ပါသည်!')
                setTimeout(() => setSuccessMessage(''), 3000)
              } else {
                setIsUploading(false)
                setProgress(0)
              }
            }}
            className={`px-4 py-2 rounded font-bold ${isUploading ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-[#ffd700] text-[#001f3f] hover:bg-[#e6c200] transition-colors'}`}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
          <h2 className="text-2xl font-bold mb-6 mt-8" style={{ color: '#ffd700' }}>Ads Section</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Text Number</label>
            <input
              type="number"
              value={formData.overview_ads?.text_number || ''}
              onChange={(e) => setFormData({
                ...formData,
                overview_ads: { ...formData.overview_ads, text_number: parseInt(e.target.value) }
              })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ad Text</label>
            <textarea
              value={formData.overview_ads?.ad_text || ''}
              onChange={(e) => setFormData({
                ...formData,
                overview_ads: { ...formData.overview_ads, ad_text: e.target.value }
              })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
              rows={4}
            />
          </div>
          <button
            onClick={() => handleFormSubmit('overview_ads')}
            className="bg-[#ffd700] text-[#001f3f] px-4 py-2 rounded hover:bg-[#e6c200] transition-colors"
          >
            Upload
          </button>
          {renderTable('overview_content')}
          {renderTable('overview_ads')}
        </div>
      )}
      {activeTab === 'home' && (
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffd700' }}>Home page</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.home_card?.title || ''}
              onChange={(e) => setFormData({
                ...formData,
                home_card: { ...formData.home_card, title: e.target.value }
              })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.home_card?.description || ''}
              onChange={(e) => setFormData({
                ...formData,
                home_card: { ...formData.home_card, description: e.target.value }
              })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">PDF File</label>
            <input
              type="file"
              onChange={(e) => setHomeFile(e.target.files ? e.target.files[0] : null)}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
            />
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500 text-white rounded text-center font-bold">
              {successMessage}
            </div>
          )}
          <div className="mb-4">
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-[#ffd700] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            {isUploading && <p className="text-white text-sm mb-2">Uploading: {progress}%</p>}
          </div>
          <button
            onClick={async () => {
              setIsUploading(true)
              setProgress(0)
              setSuccessMessage('')
              let pdfUrl = ''
              if (homeFile) {
                const fileExt = homeFile.name.split('.').pop()
                const fileName = `${Date.now()}.${fileExt}`
                const { data, error } = await supabase.storage
                  .from('home_cards')
                  .upload(fileName, homeFile, {
                    cacheControl: '3600',
                    upsert: false,
                    onUploadProgress: (progress: any) => {
                      const percent = (progress.loaded / progress.total) * 100
                      setProgress(Math.round(percent))
                    }
                  } as any)
                if (error) {
                  setError('Upload failed')
                  setIsUploading(false)
                  setProgress(0)
                  return
                }
                const { data: urlData } = supabase.storage.from('home_cards').getPublicUrl(fileName)
                pdfUrl = urlData.publicUrl
              }
              const { error } = await supabase.from('home_card').insert([{
                title: formData.home_card?.title,
                description: formData.home_card?.description,
                pdf_url: pdfUrl
              }])
              if (!error) {
                fetchData()
                setFormData({ ...formData, home_card: {} })
                setHomeFile(null)
                setIsUploading(false)
                setProgress(0)
                setSuccessMessage('တင်ခြင်း အောင်မြင်ပါသည်!')
                setTimeout(() => setSuccessMessage(''), 3000)
              } else {
                setIsUploading(false)
                setProgress(0)
              }
            }}
            className={`px-4 py-2 rounded font-bold ${isUploading ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-[#ffd700] text-[#001f3f] hover:bg-[#e6c200] transition-colors'}`}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
          <h2 className="text-2xl font-bold mb-6 mt-8" style={{ color: '#ffd700' }}>Ads Form</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ad Text</label>
            <textarea
              value={formData.home_ads?.ad_text || ''}
              onChange={(e) => setFormData({
                ...formData,
                home_ads: { ...formData.home_ads, ad_text: e.target.value }
              })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
              rows={4}
            />
          </div>
          <button
            onClick={() => handleFormSubmit('home_ads')}
            className="bg-[#ffd700] text-[#001f3f] px-4 py-2 rounded hover:bg-[#e6c200] transition-colors"
          >
            Upload
          </button>
          {renderTable('home_card')}
          {renderTable('home_ads')}
        </div>
      )}
      {activeTab === 'sidebar' && (
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffd700' }}>Sidebar Content</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={uploadFormData.title}
              onChange={(e) => setUploadFormData({ ...uploadFormData, title: e.target.value })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={uploadFormData.description}
              onChange={(e) => setUploadFormData({ ...uploadFormData, description: e.target.value })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
              rows={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Menu Category</label>
            <select
              value={uploadFormData.category}
              onChange={(e) => setUploadFormData({ ...uploadFormData, category: e.target.value as 'Videos' | 'Musics' | 'Others' })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
            >
              <option value="">Select Category</option>
              <option value="Videos">Videos</option>
              <option value="Musics">Musics</option>
              <option value="Others">Others</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sub-menu</label>
            <select
              value={uploadFormData.sub_category}
              onChange={(e) => setUploadFormData({ ...uploadFormData, sub_category: e.target.value })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
            >
              <option value="">Select Sub-category</option>
              {(uploadFormData.category === 'Videos' || uploadFormData.category === 'Musics') && (
                <>
                  <option value="Penal Code">Penal Code</option>
                  <option value="Criminal Procedure Code">Criminal Procedure Code</option>
                  <option value="Evidence Act">Evidence Act</option>
                  <option value="Police Ethics">Police Ethics</option>
                  <option value="Police Discipline Act">Police Discipline Act</option>
                </>
              )}
              {uploadFormData.category === 'Others' && (
                <>
                  <option value="Videos">Videos</option>
                  <option value="Musics">Musics</option>
                  <option value="PDFs">PDFs</option>
                </>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hugging Face URL</label>
            <input
              type="text"
              value={uploadFormData.content_url}
              onChange={(e) => setUploadFormData({ ...uploadFormData, content_url: e.target.value })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
              placeholder="Paste Hugging Face direct URL here"
            />
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500 text-white rounded text-center font-bold">
              {successMessage}
            </div>
          )}
          <div className="mb-4">
            {isUploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div className="bg-[#ffd700] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
            )}
            {isUploading && <p className="text-white text-sm mb-2">Uploading: {progress}%</p>}
          </div>
          <button
            onClick={handleUploadSubmit}
            className={`px-4 py-2 rounded font-bold ${isUploading ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-[#ffd700] text-[#001f3f] hover:bg-[#e6c200] transition-colors'}`}
            disabled={isUploading}
          >
            {isUploading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </span>
            ) : (
              'Upload'
            )}
          </button>
          {renderTable('sidebar_contents')}
        </div>
      )}
      {activeTab === 'settings' && (
        <div>
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffd700' }}>Settings</h2>
          <h3 className="text-xl font-bold mb-4" style={{ color: '#ffd700' }}>Hugging Face Settings</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hugging Face Token</label>
            <input
              type="password"
              value={appSettings.hf_token || ''}
              onChange={(e) => setAppSettings({ ...appSettings, hf_token: e.target.value })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
              placeholder="Enter Hugging Face Token"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hugging Face Repository Name</label>
            <input
              type="text"
              value={appSettings.hf_repo || ''}
              onChange={(e) => setAppSettings({ ...appSettings, hf_repo: e.target.value })}
              className="w-full p-2 bg-[#1a202c] border border-[#ffd700] text-white rounded"
              placeholder="e.g., username/repo-name"
            />
          </div>
          {successMessage && (
            <div className="mb-4 p-3 bg-green-500 text-white rounded text-center font-bold">
              {successMessage}
            </div>
          )}
          {saveError && (
            <div className="mb-4 p-3 bg-red-500 text-white rounded text-center font-bold">
              {saveError}
            </div>
          )}
          <button
            onClick={handleSaveAppSettings}
            disabled={isSaving}
            className={`px-4 py-2 rounded font-bold ${isSaving ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'bg-[#ffd700] text-[#001f3f] hover:bg-[#e6c200] transition-colors'}`}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : (
              'Save Settings'
            )}
          </button>
          <h3 className="text-xl font-bold mb-4 mt-8" style={{ color: '#ffd700' }}>Active Configuration</h3>
          <table className="w-full bg-white text-black rounded">
            <thead>
              <tr>
                <th className="p-2 border">Setting Key</th>
                <th className="p-2 border">Setting Value</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(savedSettings).map(([key, value]) => (
                <tr key={key}>
                  <td className="p-2 border">{key}</td>
                  <td className="p-2 border">{value || 'Not set'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      </div>
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
    </>
  )
}
