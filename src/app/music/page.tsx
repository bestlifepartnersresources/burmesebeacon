import { supabase } from '@/lib/supabase'
import ContentPlayer from '@/components/ContentPlayer'

export default async function MusicPage() {
  const { data: music } = await supabase
    .from('sidebar_contents')
    .select('*')
    .eq('category', 'Musics')
    .limit(1)

  if (!music || music.length === 0) {
    return (
      <div className="min-h-screen bg-[#001f3f] flex items-center justify-center">
        <p className="text-white">No music available</p>
      </div>
    )
  }
  return <ContentPlayer key={music[0].id} initialContent={music[0] as any} category="Musics" />
  
}
