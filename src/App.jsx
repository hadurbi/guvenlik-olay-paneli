
import { useState } from 'react';

const ilkOlaylar = [
  { id: 1, baslik: 'Yetkisiz giriş şüphesi', tur: 'Yetkisiz Giriş', konum: 'Ana Bina', tarih: '2026-10-11', durum: 'İnceleniyor' },
  { id: 2, baslik: 'Şüpheli hareket tespiti', tur: 'Şüpheli Hareket', konum: 'Otopark', tarih: '2026-10-10', durum: 'Yeni' },
];

const bosForm = () => ({
  baslik: '',
  tur: 'Şüpheli Hareket',
  konum: '',
  tarih: new Date().toISOString().slice(0, 10),
  durum: 'Yeni',
});

function App() {
  const [aktifSayfa, setAktifSayfa] = useState('yonetim');

  const [olaylar, setOlaylar] = useState(() => {
    try {
      const kayitlar = localStorage.getItem('guvenlikOlaylari');
      return kayitlar ? JSON.parse(kayitlar) : ilkOlaylar;
    } catch {
      return ilkOlaylar;
    }
  });

  const [form, setForm] = useState(bosForm);
  const [duzenlenenId, setDuzenlenenId] = useState(null);
  const [arama, setArama] = useState('');

  const yonetimSayfasi = aktifSayfa === 'yonetim';

  function kaydet(yeniOlaylar) {
    setOlaylar(yeniOlaylar);
    localStorage.setItem('guvenlikOlaylari', JSON.stringify(yeniOlaylar));
  }

  function formuGonder(e) {
    e.preventDefault();

    if (!form.baslik.trim() || !form.konum.trim() || !form.tarih) {
      alert('Lütfen zorunlu alanları doldurun.');
      return;
    }

    if (duzenlenenId !== null) {
      kaydet(
        olaylar.map((o) =>
          o.id === duzenlenenId ? { ...form, id: o.id } : o
        )
      );
    } else {
      kaydet([...olaylar, { ...form, id: Date.now() }]);
    }

    formuTemizle();
  }

  function formuTemizle() {
    setForm(bosForm());
    setDuzenlenenId(null);
  }

  function duzenle(olay) {
    setForm({
      baslik: olay.baslik,
      tur: olay.tur,
      konum: olay.konum,
      tarih: olay.tarih,
      durum: olay.durum,
    });

    setDuzenlenenId(olay.id);
    setAktifSayfa('yonetim');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function sil(id) {
    if (window.confirm('Bu güvenlik olayını silmek istediğinize emin misiniz?')) {
      kaydet(olaylar.filter((o) => o.id !== id));

      if (duzenlenenId === id) {
        formuTemizle();
      }
    }
  }

  const filtrelenmisOlaylar = olaylar.filter((o) =>
    `${o.baslik} ${o.tur} ${o.konum} ${o.durum}`
      .toLocaleLowerCase('tr')
      .includes(arama.toLocaleLowerCase('tr'))
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h5>SecureTrack</h5>
            <small>Güvenlik Yönetimi</small>
          </div>
        </div>

        <p className="menu-label">ANA MENÜ</p>

        <button
          type="button"
          className={`menu-item ${yonetimSayfasi ? 'active' : ''}`}
          onClick={() => setAktifSayfa('yonetim')}
        >
          ▦ &nbsp; Olay Yönetimi
        </button>

        <button
          type="button"
          className={`menu-item ${!yonetimSayfasi ? 'active' : ''}`}
          onClick={() => setAktifSayfa('kayitlar')}
        >
          ◷ &nbsp; Olay Kayıtları
        </button>

        <div className="sidebar-bottom">
          <div className="avatar">G</div>
          <div>
            <strong>Güvenlik Ekibi</strong>
            <small>Yönetim Paneli</small>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span>
            Güvenlik Merkezi /{' '}
            {yonetimSayfasi ? 'Olay Yönetimi' : 'Olay Kayıtları'}
          </span>
          <span className="live-label">
            <span /> Sistem aktif
          </span>
        </header>

        <section className="page-heading">
          <div>
            <p className="eyebrow">GÜVENLİK OPERASYONLARI</p>
            <h1>{yonetimSayfasi ? 'Olay Yönetimi' : 'Olay Kayıtları'}</h1>
            <p>
              {yonetimSayfasi
                ? 'Güvenlik olaylarını tek bir yerden yönetin ve takip edin.'
                : 'Kayıtlı güvenlik olaylarını görüntüleyin, arayın ve yönetin.'}
            </p>
          </div>
          <div className="date-chip">
            {new Date().toLocaleDateString('tr-TR')}
          </div>
        </section>

        {yonetimSayfasi && (
          <>
            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon blue">▦</span>
                <p>Toplam Olay</p>
                <h2>{olaylar.length}</h2>
                <small>Kayıtlı güvenlik olayı</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon orange">◷</span>
                <p>Yeni Olaylar</p>
                <h2>{olaylar.filter((o) => o.durum === 'Yeni').length}</h2>
                <small>Henüz işleme alınmayan</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon purple">◎</span>
                <p>İncelenen</p>
                <h2>
                  {olaylar.filter((o) => o.durum === 'İnceleniyor').length}
                </h2>
                <small>İnceleme sürecindeki</small>
              </div>

              <div className="stat-card">
                <span className="stat-icon green">✓</span>
                <p>Çözülen</p>
                <h2>{olaylar.filter((o) => o.durum === 'Çözüldü').length}</h2>
                <small>Tamamlanan olaylar</small>
              </div>
            </section>

            <section className="panel-card">
              <div className="section-title">
                <div>
                  <h3>
                    {duzenlenenId !== null
                      ? 'Olayı Güncelle'
                      : 'Yeni Güvenlik Olayı'}
                  </h3>
                  <p>Olay bilgilerini aşağıdaki formdan girin.</p>
                </div>

                {duzenlenenId !== null && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={formuTemizle}
                  >
                    İptal
                  </button>
                )}
              </div>

              <form onSubmit={formuGonder}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Olay Başlığı *</label>
                    <input
                      className="form-control"
                      name="baslik"
                      value={form.baslik}
                      onChange={(e) =>
                        setForm({ ...form, baslik: e.target.value })
                      }
                      placeholder="Örn. Yetkisiz giriş şüphesi"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Olay Türü</label>
                    <select
                      className="form-select"
                      name="tur"
                      value={form.tur}
                      onChange={(e) =>
                        setForm({ ...form, tur: e.target.value })
                      }
                    >
                      <option>Şüpheli Hareket</option>
                      <option>Yetkisiz Giriş</option>
                      <option>Hırsızlık</option>
                      <option>Vandalizm</option>
                      <option>Diğer</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Konum *</label>
                    <input
                      className="form-control"
                      name="konum"
                      value={form.konum}
                      onChange={(e) =>
                        setForm({ ...form, konum: e.target.value })
                      }
                      placeholder="Örn. Ana Bina"
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Tarih *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="tarih"
                      value={form.tarih}
                      onChange={(e) =>
                        setForm({ ...form, tarih: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Durum</label>
                    <select
                      className="form-select"
                      name="durum"
                      value={form.durum}
                      onChange={(e) =>
                        setForm({ ...form, durum: e.target.value })
                      }
                    >
                      <option>Yeni</option>
                      <option>İnceleniyor</option>
                      <option>Çözüldü</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={formuTemizle}
                  >
                    Temizle
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {duzenlenenId !== null
                      ? 'Değişiklikleri Kaydet'
                      : '+ Olay Ekle'}
                  </button>
                </div>
              </form>
            </section>
          </>
        )}

        <section className="panel-card">
          <div className="section-title list-heading">
            <div>
              <h3>
                {yonetimSayfasi ? 'Güvenlik Olayları' : 'Tüm Olay Kayıtları'}
              </h3>
              <p>Sistemdeki olay kayıtlarını görüntüleyin ve yönetin.</p>
            </div>

            <input
              className="form-control search-input"
              value={arama}
              onChange={(e) => setArama(e.target.value)}
              placeholder="Olaylarda ara..."
              aria-label="Olaylarda ara"
            />
          </div>

          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>OLAY</th>
                  <th>TÜR</th>
                  <th>KONUM</th>
                  <th>TARİH</th>
                  <th>DURUM</th>
                  <th>İŞLEMLER</th>
                </tr>
              </thead>

              <tbody>
                {filtrelenmisOlaylar.map((olay) => (
                  <tr key={olay.id}>
                    <td>
                      <strong>{olay.baslik}</strong>
                      <small className="table-subtitle">ID: {olay.id}</small>
                    </td>
                    <td>{olay.tur}</td>
                    <td>{olay.konum}</td>
                    <td>
                      {new Date(`${olay.tarih}T12:00:00`).toLocaleDateString(
                        'tr-TR'
                      )}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          olay.durum === 'Yeni'
                            ? 'status-new'
                            : olay.durum === 'Çözüldü'
                              ? 'status-done'
                              : 'status-review'
                        }`}
                      >
                        {olay.durum}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => duzenle(olay)}
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => sil(olay.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtrelenmisOlaylar.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Aramanızla eşleşen olay bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            Gösterilen kayıt: {filtrelenmisOlaylar.length} / {olaylar.length}
          </div>
        </section>

        <footer className="page-footer">
          SecureTrack · Güvenlik Olayları Yönetim Paneli
        </footer>
      </main>
    </div>
  );
}

export default App;
