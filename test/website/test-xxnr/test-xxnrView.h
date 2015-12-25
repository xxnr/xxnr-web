// test-xxnrView.h : interface of the CtestxxnrView class
//


#pragma once

class CtestxxnrDoc;

class CtestxxnrView : public CHtmlView
{
protected: // create from serialization only
	CtestxxnrView();
	DECLARE_DYNCREATE(CtestxxnrView)

// Attributes
public:
	CtestxxnrDoc* GetDocument() const;

// Operations
public:

// Overrides
public:
	virtual BOOL PreCreateWindow(CREATESTRUCT& cs);
protected:
	virtual void OnInitialUpdate(); // called first time after construct

// Implementation
public:
	virtual ~CtestxxnrView();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:

// Generated message map functions
protected:
	DECLARE_MESSAGE_MAP()
public:
	virtual void OnNavigateComplete2(LPCTSTR strURL);

	BOOL CreateControlSite(COleControlContainer* pContainer,   
       COleControlSite** ppSite, UINT /* nID */, REFCLSID /* clsid */)  ;

	void LoadUrlTimeout(LPCTSTR lpcstrUrl, long double fTimeout);
};

#ifndef _DEBUG  // debug version in test-xxnrView.cpp
inline CtestxxnrDoc* CtestxxnrView::GetDocument() const
   { return reinterpret_cast<CtestxxnrDoc*>(m_pDocument); }
#endif

