// test-xxnrDoc.cpp : implementation of the CtestxxnrDoc class
//

#include "stdafx.h"
#include "test-xxnr.h"

#include "test-xxnrDoc.h"

#ifdef _DEBUG
#define new DEBUG_NEW
#endif


// CtestxxnrDoc

IMPLEMENT_DYNCREATE(CtestxxnrDoc, CDocument)

BEGIN_MESSAGE_MAP(CtestxxnrDoc, CDocument)
END_MESSAGE_MAP()


// CtestxxnrDoc construction/destruction

CtestxxnrDoc::CtestxxnrDoc()
{
	// TODO: add one-time construction code here

}

CtestxxnrDoc::~CtestxxnrDoc()
{
}

BOOL CtestxxnrDoc::OnNewDocument()
{
	if (!CDocument::OnNewDocument())
		return FALSE;

	// TODO: add reinitialization code here
	// (SDI documents will reuse this document)

	return TRUE;
}




// CtestxxnrDoc serialization

void CtestxxnrDoc::Serialize(CArchive& ar)
{
	if (ar.IsStoring())
	{
		// TODO: add storing code here
	}
	else
	{
		// TODO: add loading code here
	}
}


// CtestxxnrDoc diagnostics

#ifdef _DEBUG
void CtestxxnrDoc::AssertValid() const
{
	CDocument::AssertValid();
}

void CtestxxnrDoc::Dump(CDumpContext& dc) const
{
	CDocument::Dump(dc);
}
#endif //_DEBUG


// CtestxxnrDoc commands
