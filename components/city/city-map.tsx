const districts = [
  { name: 'Executive Hills', x: '15%', y: '18%' },
  { name: 'S/ Star Academy', x: '52%', y: '15%' },
  { name: 'Creator Valley', x: '80%', y: '35%' },
  { name: 'Commerce Park', x: '65%', y: '72%' },
  { name: 'Innovation Docks', x: '30%', y: '78%' },
  { name: 'Wellness Gardens', x: '12%', y: '55%' }
];

export function CityMap() {
  return (
    <div className='card p-6'>
      <div className='mb-4'>
        <h2 className='text-2xl font-semibold'>City Map</h2>
        <p className='text-sm opacity-70'>First visual layer of the city.</p>
      </div>
      <div className='relative h-[700px] rounded-3xl border overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950'>
        {districts.map((d) => (
          <div key={d.name} className='absolute -translate-x-1/2 -translate-y-1/2'>
            <div style={{left:d.x,top:d.y,position:'absolute'}}>
              <div className='rounded-full border px-5 py-3 backdrop-blur bg-white/10'>
                {d.name}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
