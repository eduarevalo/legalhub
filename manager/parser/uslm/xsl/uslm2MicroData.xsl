<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" 
    xmlns:xd="http://www.oxygenxml.com/ns/doc/xsl"
    xmlns:uslm="http://xml.house.gov/schemas/uslm/1.0"
    xpath-default-namespace="http://xml.house.gov/schemas/uslm/1.0"    
    xmlns="http://xml.house.gov/schemas/uslm/1.0" 
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/"
    version="2.0" >
    <xd:doc scope="stylesheet">
        <xd:desc>
            <xd:p><xd:b>Created on:</xd:b> Aug 8, 2016</xd:p>
            <xd:p><xd:b>Author:</xd:b> arevalo</xd:p>
            <xd:p></xd:p>
        </xd:desc>
    </xd:doc>
    <xsl:template match="/">
        <div itemscope="" itemtype="uslm">
            <xsl:apply-templates/>
        </div>
    </xsl:template>
    <xsl:template match="meta|toc|notes|note" mode="block"/>
    <xsl:template match="*[child::num|child::heading]" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates select="num|heading" mode="inline"/>
        </p>
        <xsl:apply-templates select="*[not(self::num)][not(self::heading)]"/>
    </xsl:template>
    <xsl:template match="*">
        <xsl:apply-templates select="." mode="block"/>
    </xsl:template>
    <xsl:template match="content" mode="block">
        <xsl:apply-templates mode="block"/>
    </xsl:template>
    <xsl:template match="p" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="parent::*/name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates/>
        </p>
    </xsl:template>
    <xsl:template match="*" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
        </p>
        <xsl:apply-templates/>
    </xsl:template>
    <xsl:template match="sourceCredit" mode="block">
        <p>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:apply-templates mode="inline"/>
        </p>
    </xsl:template>
    <xsl:template match="ref|date">
        <xsl:apply-templates select="." mode="inline"/>
    </xsl:template>
    <xsl:template match="*" mode="inline">
        <span>
            <xsl:attribute name="itemtype">
                <xsl:value-of select="name()"/>
            </xsl:attribute>
            <xsl:copy-of select="@*"/>
            <xsl:apply-templates mode="inline"/>
        </span>
    </xsl:template>
</xsl:stylesheet>
