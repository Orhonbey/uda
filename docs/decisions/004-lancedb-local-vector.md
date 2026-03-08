# 004 — LanceDB Lokal Vektor Veritabani

Tarih: 2026-03-08
Durum: Aktif
Ilgili: src/utils/lancedb.js, src/core/rag.js

## Baglam

RAG sistemi icin vektor veritabani secilmesi gerekiyor. UDA'nin temel prensibi: zero cloud dependency, tamamen lokal.

## Karar

LanceDB kullanilir. Embedding'ler @xenova/transformers ile lokal olarak uretilir (all-MiniLM-L6-v2).

## Neden

- Tamamen lokal — server yok, API key yok, internet baglantisi gerektirmez
- Node.js native — ayri proses calistirmaya gerek yok
- Dosya-bazli storage — .uda/ icinde tasiyabilir
- Yeterli performans — binlerce dokuman icin hizli arama

## Alternatifler

- ChromaDB → Reddedildi: Python bagimliligi, ayri server gerektirir
- Pinecone/Weaviate → Reddedildi: cloud-based, UDA'nin lokal prensibine aykiri
- Basit cosine similarity (kendi impl.) → Reddedildi: olceklenmez, index yok
