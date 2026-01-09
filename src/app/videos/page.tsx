import { supabase } from '@/lib/supabase'
import ContentPlayer from '@/components/ContentPlayer'

export default async function VideosPage() {
  const { data: videos } = await supabase
    .from('sidebar_contents')
    .select('*')
    .eq('category', 'Videos')
    .limit(1)

  if (!videos || videos.length === 0) {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center">
        <p className="text-white">No videos available</p>
      </div>
    )
  }
return <ContentPlayer key={videos[0].id} initialContent={videos[0]} category="Videos" />
 
}
