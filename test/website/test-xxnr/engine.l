
%{
#include "engine.tab.hpp"
 
#include <stdio.h>
#include <string.h>
#include <io.h>

// extern char* yylval;
extern YYSTYPE	yylval;

%}
char [A-Za-z]
num [0-9]
space [ \t\r\n\b\f]
non-space [^ \t\r\n\b\f]

%x PROCESSING_URL S1 S2 S3
%% 
[T|t][R|r][U|u][E|e] {return BOOLEAN_TRUE;}
[T|t][I|i][M|m][E|e][O|o][U|u][T|t] {return TIMEOUT;}
[V|v][E|e][R|r][I|i][F|f][Y|y]	{return VERIFY;}

[L|l][O|o][A|a][D|d] { BEGIN PROCESSING_URL; return LOAD;}
<PROCESSING_URL>{non-space}+ {BEGIN INITIAL; yylval.setText(yytext); return URL; }
{num}+([\.]{num}*){0,1}	{return NUMBER;}
{char}({char}|{num})* {return ID;}
{space} { }
. {return yytext[0];}

%%
int yywrap()
{
return 1;
}

// char* yylval;

// int isatty YY_PROTO(( int n)){ return _isatty(n); }