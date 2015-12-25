// test-xxnrDoc.h : interface of the CtestxxnrDoc class
//


#pragma once


class CtestxxnrDoc : public CDocument
{
protected: // create from serialization only
	CtestxxnrDoc();
	DECLARE_DYNCREATE(CtestxxnrDoc)

// Attributes
public:

// Operations
public:

// Overrides
public:
	virtual BOOL OnNewDocument();
	virtual void Serialize(CArchive& ar);

// Implementation
public:
	virtual ~CtestxxnrDoc();
#ifdef _DEBUG
	virtual void AssertValid() const;
	virtual void Dump(CDumpContext& dc) const;
#endif

protected:

// Generated message map functions
protected:
	DECLARE_MESSAGE_MAP()
};


